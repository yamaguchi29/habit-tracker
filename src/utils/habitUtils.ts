import { isBefore, startOfDay, parseISO } from 'date-fns';

export interface HabitData {
  id?: string;
  createdAt?: any;
  daysOfWeek?: number[];
  [key: string]: any;
}

/**
 * 対象日付において、その習慣が「既に登録されており、かつ指定曜日に該当するか」を判定する。
 * @param habit 判定対象の習慣データ
 * @param dateStr 判定する対象の日付 (Date型 または 'YYYY-MM-DD' 形式の文字列)
 * @returns 該当日はアクティブであれば true
 */
export function isHabitActiveOnDate(habit: HabitData, targetDate: Date | string): boolean {
  const date = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const targetDayOfWeek = date.getDay();

  // 1. 曜日の判定
  if (habit.daysOfWeek && !habit.daysOfWeek.includes(targetDayOfWeek)) {
    return false;
  }

  // 2. 作成日の判定
  // createdAt が null(ローカルキャッシュの未確定状態) の場合はそのまま true (追加直後とみなす)
  if (habit.createdAt) {
    let createdDate: Date | null = null;
    
    if (typeof habit.createdAt.toDate === 'function') {
      createdDate = habit.createdAt.toDate();
    } else if (habit.createdAt.seconds) {
      createdDate = new Date(habit.createdAt.seconds * 1000);
    } else if (typeof habit.createdAt === 'string' || typeof habit.createdAt === 'number') {
      createdDate = new Date(habit.createdAt);
    }

    if (createdDate) {
      const targetDayStart = startOfDay(date);
      const creationDayStart = startOfDay(createdDate);

      // 判定対象の日付が、実際の作成日よりも「前」であれば非アクティブ
      if (isBefore(targetDayStart, creationDayStart)) {
        return false;
      }
    }
  }

  // 3. 削除日の判定
  if (habit.deletedAt) {
    let deletedDate: Date | null = null;
    if (typeof habit.deletedAt.toDate === 'function') {
      deletedDate = habit.deletedAt.toDate();
    } else if (habit.deletedAt.seconds) {
      deletedDate = new Date(habit.deletedAt.seconds * 1000);
    } else if (typeof habit.deletedAt === 'string' || typeof habit.deletedAt === 'number') {
      deletedDate = new Date(habit.deletedAt);
    }

    if (deletedDate) {
      const targetDayStart = startOfDay(date);
      const deletionDayStart = startOfDay(deletedDate);

      // 判定対象の日付が、削除日と「同じかそれ以降」であれば非アクティブ
      // (isBefore が false かつ 同一日のチェック)
      if (!isBefore(targetDayStart, deletionDayStart)) {
        return false;
      }
    }
  }

  return true;
}

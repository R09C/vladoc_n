/**
 * Базовый интерфейс для всех сущностей
 * Общие поля, присутствующие во всех моделях данных
 */

/** Базовые поля, присутствующие во всех сущностях */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

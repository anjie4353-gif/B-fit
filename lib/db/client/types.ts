export interface ClientDbAdapter {
  init(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  execute(sql: string): Promise<void>;
  run(sql: string, params?: (string | number | null)[]): Promise<void>;
  queryScalar(sql: string, params?: (string | number | null)[]): Promise<string | null>;
}
use rusqlite::{Connection, Params, Error};

pub static DB_FILE: &'static str = "./db";

pub fn init_db() {
    let conn = get_db();

    _ = conn.execute("
        CREATE TABLE IF NOT EXISTS `characters` (
            `id`	INTEGER NOT NULL UNIQUE,
            `name`	TEXT NOT NULL,
            `json`	TEXT NOT NULL,
            PRIMARY KEY(`id` AUTOINCREMENT)
        );
    ", ());

    _ = conn.execute("
        CREATE TABLE IF NOT EXISTS `weapons` (
            `id`	INTEGER NOT NULL UNIQUE,
            `name`	TEXT NOT NULL,
            `json`	TEXT NOT NULL,
            PRIMARY KEY(`id` AUTOINCREMENT)
        );
    ", ());

    conn.close().unwrap();
}

pub fn get_db() -> Connection {
    Connection::open(DB_FILE).unwrap()
}

pub fn execute_query<P: Params>(sql: &str, params: P) -> Result<usize, Error> {
    let conn = get_db();
    let res = conn.execute(sql, params);

    conn.close().unwrap();
    res
}

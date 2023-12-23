use rusqlite::{Connection, Error};
use serde::Serialize;

pub static DB_FILE: &'static str = "./db";

#[derive(Serialize)]
pub struct RowData {
    pub id: i32,
    pub name: String,
    pub json: String,
}

#[derive(Serialize)]
pub struct QueryResult<T> {
    pub success: bool,
    pub result: T,
    pub msg: String,
}

pub fn get_db() -> Connection {
    Connection::open(DB_FILE).unwrap()
}

pub fn init_db() {
    let conn = get_db();

    _ = conn.execute(
        "
        CREATE TABLE IF NOT EXISTS `characters` (
            `id`	INTEGER NOT NULL UNIQUE,
            `name`	TEXT NOT NULL,
            `json`	TEXT NOT NULL,
            PRIMARY KEY(`id` AUTOINCREMENT)
        );
    ",
        (),
    );

    _ = conn.execute(
        "
        CREATE TABLE IF NOT EXISTS `weapons` (
            `id`	INTEGER NOT NULL UNIQUE,
            `name`	TEXT NOT NULL,
            `json`	TEXT NOT NULL,
            PRIMARY KEY(`id` AUTOINCREMENT)
        );
    ",
        (),
    );
}

fn error_result<T>(err: Error) -> QueryResult<T>
where
    T: Default,
{
    QueryResult {
        success: false,
        result: T::default(),
        msg: err.to_string(),
    }
}

pub fn get_rows(table: &str) -> QueryResult<Vec<RowData>> {
    let conn = get_db();

    let mut query = match conn.prepare(format!("SELECT * FROM {}", table).as_str()) {
        Ok(res) => res,
        Err(err) => {
            return error_result(err);
        }
    };

    match query.query_map([], |row| {
        Ok(RowData {
            id: row.get(0)?,
            name: row.get(1)?,
            json: row.get(2)?,
        })
    }) {
        Ok(row_iter) => {
            return QueryResult {
                success: true,
                result: row_iter.filter(|e| e.is_ok()).map(|e| e.unwrap()).collect(),
                msg: "".into(),
            };
        }
        Err(err) => {
            return error_result(err);
        }
    };
}

pub fn insert_row(table: &str, name: &str, json: &str) -> QueryResult<usize> {
    let conn = get_db();

    let res = conn.execute(
        format!("INSERT INTO {} (name, json) VALUES (?, ?)", table).as_str(),
        [name, json],
    );

    if res.is_ok() {
        return QueryResult {
            success: true,
            result: res.unwrap(),
            msg: "".into(),
        };
    }

    error_result(res.err().unwrap())
}

pub fn delete_row(table: &str, id: i32) -> QueryResult<usize> {
    let conn = get_db();

    let res = conn.execute(format!("DELETE FROM {} WHERE id = ?", table).as_str(), [id]);

    if res.is_ok() {
        return QueryResult {
            success: true,
            result: res.unwrap(),
            msg: "".into()
        };
    }

    error_result(res.err().unwrap())
}
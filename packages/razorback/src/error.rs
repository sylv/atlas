use thiserror::Error;

use crate::value::Value;

#[derive(Error, Debug)]
pub enum EngineError {
    #[error("Cannot convert type {from:?} to {to:?}")]
    IncompatibleTypes { from: Value, to: String },
    #[error("Cannot parse type")]
    UnprocessableType,
    #[error("Unknown tag name {0}")]
    UnknownTag(String),
    #[error("Missing value")]
    MissingValue,
}

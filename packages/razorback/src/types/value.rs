use std::fmt::Display;

use crate::{error::EngineError, serializer::serialize_value};

#[derive(Debug, Clone)]
pub enum Value {
    String(String),
    Integer(u64),
    Float(f64),
    Boolean(bool),
    Array(Vec<Value>),
    Object(Vec<(String, Value)>),
}

// make it so println!() can be used with Value
impl Display for Value {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let result = serialize_value(self.clone(), false);
        write!(f, "{}", result)
    }
}

impl TryInto<u64> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<u64, Self::Error> {
        match self {
            Value::Integer(integer) => Ok(integer),
            Value::Float(float) => Ok(float as u64),
            Value::String(string) => string.parse().map_err(|_| EngineError::UnprocessableType),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u64".to_string(),
            }),
            Value::Boolean(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u64".to_string(),
            }),
            Value::Array(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u64".to_string(),
            }),
        }
    }
}

impl TryInto<u32> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<u32, Self::Error> {
        match self {
            Value::Integer(integer) => Ok(integer as u32),
            Value::Float(float) => Ok(float as u32),
            Value::String(string) => string.parse().map_err(|_| EngineError::UnprocessableType),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u32".to_string(),
            }),
            Value::Boolean(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u32".to_string(),
            }),
            Value::Array(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "u32".to_string(),
            }),
        }
    }
}

impl TryInto<bool> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<bool, Self::Error> {
        match self {
            Value::Integer(integer) => match integer {
                0 => Ok(false),
                1 => Ok(true),
                _ => Err(EngineError::UnprocessableType),
            },
            Value::Float(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "bool".to_string(),
            }),
            Value::String(string) => match string.as_str() {
                "true" | "1" | "yes" | "ok" => Ok(true),
                "false" | "0" | "no" | "cancel" => Ok(false),
                _ => Err(EngineError::UnprocessableType),
            },
            Value::Boolean(boolean) => Ok(boolean),
            Value::Array(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "bool".to_string(),
            }),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "bool".to_string(),
            }),
        }
    }
}

impl TryInto<f64> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<f64, Self::Error> {
        match self {
            Value::Integer(integer) => Ok(integer as f64),
            Value::Float(float) => Ok(float),
            Value::String(string) => string.parse().map_err(|_| EngineError::UnprocessableType),
            Value::Boolean(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "f64".to_string(),
            }),
            Value::Array(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "f64".to_string(),
            }),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "f64".to_string(),
            }),
        }
    }
}

impl TryInto<String> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<String, Self::Error> {
        match self {
            Value::String(string) => Ok(string),
            Value::Integer(integer) => Ok(integer.to_string()),
            Value::Float(float) => Ok(float.to_string()),
            Value::Boolean(boolean) => Ok(boolean.to_string()),
            Value::Array(values) => Ok(values
                .iter()
                .map(|value| value.to_string())
                .collect::<Vec<String>>()
                .join("")),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "String".to_string(),
            }),
        }
    }
}

impl TryInto<Vec<Value>> for Value {
    type Error = EngineError;

    fn try_into(self) -> Result<Vec<Value>, Self::Error> {
        match self {
            Value::Array(array) => Ok(array),
            Value::String(string) => Ok(vec![Value::String(string)]),
            Value::Integer(integer) => Ok(vec![Value::Integer(integer)]),
            Value::Float(float) => Ok(vec![Value::Float(float)]),
            Value::Boolean(boolean) => Ok(vec![Value::Boolean(boolean)]),
            Value::Object(_) => Err(EngineError::IncompatibleTypes {
                from: self,
                to: "Vec<Value>".to_string(),
            }),
        }
    }
}

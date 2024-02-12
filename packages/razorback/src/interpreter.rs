use std::collections::HashMap;

use crate::{
    error::EngineError,
    register::EngineRegister,
    serializer::serialize_value,
    types::{node::Node, value::Value},
};

pub struct Interpreter {
    variables: HashMap<String, Value>,
    register: EngineRegister,
}

impl Interpreter {
    pub fn new(register: EngineRegister) -> Self {
        Self {
            variables: HashMap::new(),
            register,
        }
    }

    pub fn interpret_string(&mut self, value: &Node) -> Result<Option<String>, EngineError> {
        let value = self.interpret_raw(value)?;
        Ok(value.map(serialize_value))
    }

    pub fn interpret_raw(&mut self, value: &Node) -> Result<Option<Value>, EngineError> {
        match value {
            Node::Comment(_) => Ok(None),
            Node::Value(parts) => {
                let mut result = Vec::new();
                for part in parts {
                    let value = self.interpret_raw(part)?;
                    if let Some(value) = value {
                        result.push(value);
                    }
                }

                // if the result length is 1, we can return the value directly
                // this helps with unnecessarily converting values to strings and back to ints or
                // whatever just because of some whitespace.
                if result.len() == 1 {
                    return Ok(Some(result.remove(0)));
                }

                Ok(Some(Value::Array(result)))
            }
            Node::Text(text) => Ok(Some(Value::String(text.to_string()))),
            Node::Tag { name, children } => {
                let function = self.register.get_handler(name);
                if let Some(function) = function {
                    return function(self, children);
                }

                Err(EngineError::UnknownTag(name.to_string()))
            }
            Node::VariableAssignment { name, value } => {
                let value = self.interpret_raw(value)?;
                if let Some(value) = value {
                    self.variables.insert(name.to_string(), value);
                } else {
                    self.variables.remove(&name.to_string());
                }

                Ok(None)
            }
            Node::VariableReference(name) => {
                let value = self.variables.get(&name.to_string());
                if let Some(value) = value {
                    Ok(Some(value.clone()))
                } else {
                    Ok(None)
                }
            }
            Node::Array(children) => {
                let mut result = Vec::new();
                for child in children {
                    let value = self.interpret_raw(child)?;
                    if let Some(value) = value {
                        result.push(value);
                    }
                }

                Ok(Some(Value::Array(result)))
            }
            Node::Object(children) => {
                let mut result: Vec<(String, Value)> = Vec::new();
                for (key, value) in children {
                    let value = self.interpret_raw(value)?;
                    if let Some(value) = value {
                        result.push((key.to_string(), value));
                    }
                }

                Ok(Some(Value::Object(result)))
            }
            value => unimplemented!("{:?}", value),
        }
    }
}

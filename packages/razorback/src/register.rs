use std::collections::HashMap;
extern crate proc_macro;
use crate::{error::EngineError, interpreter::Interpreter, parser::Node, value::Value};

type TagHandler = fn(&mut Interpreter, &Vec<Node>) -> Result<Option<Value>, EngineError>;

pub struct EngineRegister {
    functions: HashMap<String, TagHandler>,
}

impl EngineRegister {
    pub fn new() -> Self {
        Self {
            functions: HashMap::new(),
        }
    }

    pub fn add_handler(&mut self, name: &str, function: TagHandler) {
        self.functions.insert(name.to_string(), function);
    }

    pub fn get_handler(&self, name: &str) -> Option<&TagHandler> {
        self.functions.get(name)
    }
}

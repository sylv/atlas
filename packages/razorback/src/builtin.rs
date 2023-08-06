use crate::error::EngineError;
use crate::parser::Node;
use crate::register::EngineRegister;
use crate::value::Value;
use crate::Interpreter;
use rand::Rng;
use razorback_derive::razorback_tag;

#[razorback_tag]
pub fn random_int_tag(one: u64, two: u64) -> Result<Option<Value>, EngineError> {
    let mut rng = rand::thread_rng();
    let num = rng.gen_range(one..two);
    Ok(Some(Value::Integer(num)))
}

#[razorback_tag]
pub fn add_tag(one: u64, two: u64) -> Result<Option<Value>, EngineError> {
    Ok(Some(Value::Integer(one + two)))
}

#[razorback_tag]
pub fn length_tag(value: Value) -> Result<Option<Value>, EngineError> {
    let length = match value {
        Value::Array(vec) => vec.len(),
        _ => {
            let str: String = value.try_into()?;
            str.len()
        }
    };

    Ok(Some(Value::Integer(length as u64)))
}

pub fn register_tags(register: &mut EngineRegister) {
    register.add_handler("randomInt", random_int_tag);
    register.add_handler("add", add_tag);
    register.add_handler("length", length_tag);
    register.add_handler("for", |interpreter, children| {
        let iterations = 10000;
        let mut result = Vec::new();
        for _ in 0..iterations {
            for child in children {
                let value = interpreter.interpret_raw(child)?;
                if let Some(value) = value {
                    result.push(value);
                }
            }
        }

        Ok(Some(Value::Array(result)))
    })
}

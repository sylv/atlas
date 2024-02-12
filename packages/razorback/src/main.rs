use builtin::register_tags;

use crate::interpreter::Interpreter;
use crate::parser::*;
use crate::register::EngineRegister;
use crate::serializer::serialize_node;

mod builtin;
mod error;
mod interpreter;
mod parser;
mod register;
mod serializer;
mod types;

fn main() {
    let input = r#"{{ 
        "key": "value", 
        "nested": { "key": "{key;value}" } 
    }}"#;

    // setup register
    let mut register = EngineRegister::new();
    register_tags(&mut register);

    let start = std::time::Instant::now();

    // parse and interpret script
    let script = parse_to_node(input).unwrap();
    println!("{:?}", script);
    let mut interpreter = Interpreter::new(register);
    let result = interpreter.interpret_string(&script);
    if let Err(err) = result {
        println!("Error: {}", err);
    } else if let Ok(result) = result {
        println!("Run in {:?}", start.elapsed());
        let serialized = serialize_node(&script);
        println!("Serialized matches: {}", serialized == input);

        if let Some(result) = result {
            println!("{}", result);
        } else {
            println!("No result");
        }

        if serialized != input {
            println!("Serialized: {}", serialized);
        }
    }
}

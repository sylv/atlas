use builtin::register_tags;

use crate::interpreter::Interpreter;
use crate::parser::*;
use crate::register::EngineRegister;

mod builtin;
mod error;
mod interpreter;
mod parser;
mod register;
mod serializer;
mod types;

fn main() {
    let input = r#"{echo `template {{echo "test"}}`}"#;

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
        if let Some(result) = result {
            println!("{}", result);
        } else {
            println!("No result");
        }

        println!("Run in {:?}", start.elapsed());
    }
}

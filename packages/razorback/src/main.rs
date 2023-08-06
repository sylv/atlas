use builtin::register_tags;

use crate::interpreter::Interpreter;
use crate::parser::*;
use crate::register::EngineRegister;

mod builtin;
mod error;
mod interpreter;
mod parser;
mod register;
mod value;

fn main() {
    let input = "{=key;{[one;two]}}{for;{length;{$key}}}";

    // setup register
    let mut register = EngineRegister::new();
    register_tags(&mut register);

    let start = std::time::Instant::now();

    // parse and interpret script
    let script = parse_to_node(input).unwrap();
    let mut interpreter = Interpreter::new(register);
    let result = interpreter.interpret_string(&script);
    if let Err(err) = result {
        println!("Error: {}", err);
    } else if let Ok(result) = result {
        println!("Run in {:?}", start.elapsed());
        println!("Serialized matches: {}", serialize_node(&script) == input);

        if let Some(result) = result {
            println!("{}", result);
        } else {
            println!("No result");
        }
    }
}

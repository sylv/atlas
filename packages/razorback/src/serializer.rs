use crate::types::{node::Node, value::Value};

pub fn serialize_node(val: &Node) -> String {
    match val {
        Node::Value(children) => {
            let mut result = String::new();
            for child in children {
                result.push_str(&serialize_node(child));
            }

            result
        }
        Node::Object(children) => {
            let mut result = String::new();
            result.push_str("{{");
            for (i, (key, value)) in children.iter().enumerate() {
                if i != 0 {
                    result.push(',');
                }
                result.push('"');
                result.push_str(key);
                result.push('"');
                result.push(':');
                result.push_str(&serialize_node_for_object(value));
            }
            result.push_str("}}");
            result
        }
        Node::Text(text) => text.to_string(),
        Node::Tag { name, children } => {
            let mut result = String::new();
            result.push('{');
            result.push_str(name);
            let mut is_in_params = false;
            for child in children {
                // {tag option=value;param1}
                // we have to serialize the options first
                // and then the params
                match child {
                    Node::TagOption { name, value } => {
                        if is_in_params {
                            panic!("Cannot have a tag option after a tag param");
                        }

                        result.push(' ');
                        result.push_str(name);
                        result.push_str("=\"");
                        result.push_str(&serialize_node(value));
                        result.push('"');
                    }
                    _ => {
                        if !is_in_params {
                            is_in_params = true;
                        }

                        result.push(';');
                        result.push_str(&serialize_node(child));
                    }
                }
            }
            result.push('}');
            result
        }
        Node::TagOption { name, value } => {
            let mut result = String::new();
            result.push_str(name);
            result.push('=');
            result.push('"');
            result.push_str(&serialize_node(value));
            result.push('"');
            result
        }
        Node::VariableAssignment { name, value } => {
            let mut result = String::new();
            result.push_str("{=");
            result.push_str(name);
            result.push(';');
            result.push_str(&serialize_node(value));
            result.push('}');
            result
        }
        Node::VariableReference(name) => {
            let mut result = String::new();
            result.push_str("{$");
            result.push_str(name);
            result.push('}');
            result
        }
        Node::Array(children) => {
            let mut result = String::new();
            result.push_str("{[");
            for (i, child) in children.iter().enumerate() {
                if i != 0 {
                    result.push(';');
                }
                result.push_str(&serialize_node(child));
            }
            result.push_str("]}");
            result
        }
        Node::Comment(comment) => {
            let mut result = String::new();
            result.push_str(comment);
            result
        }
    }
}

pub fn serialize_node_for_object(val: &Node) -> String {
    match val {
        Node::Text(text) => format!("\"{}\"", text),
        Node::Object(_) => {
            let result = serialize_node(val);
            result[1..result.len() - 1].to_string()
        }
        _ => serialize_node(val),
    }
}

pub fn serialize_value(value: Value) -> String {
    match value {
        Value::String(string) => string,
        Value::Integer(integer) => integer.to_string(),
        Value::Float(float) => float.to_string(),
        Value::Boolean(boolean) => boolean.to_string(),
        Value::Array(array) => {
            let mut result = String::new();
            result.push_str("{[");
            for (i, value) in array.iter().enumerate() {
                if i != 0 {
                    result.push(';');
                }
                result.push_str(&serialize_value(value.clone()));
            }
            result.push_str("]}");
            result
        }
        Value::Object(object) => {
            let mut result = String::new();
            result.push_str("{{");
            for (i, (key, value)) in object.iter().enumerate() {
                result.push('"');
                result.push_str(key);
                result.push('"');
                result.push(':');
                result.push_str(&serialize_value_for_object(value.clone()));
            }
            result.push_str("}}");
            result
        }
    }
}

pub fn serialize_value_for_object(value: Value) -> String {
    match value {
        Value::String(string) => format!("\"{}\"", string),
        Value::Object(_) => {
            let result = serialize_value(value);
            result[1..result.len() - 1].to_string()
        }
        value => serialize_value(value),
    }
}

use crate::types::value::Value;

pub fn serialize_value(value: Value, plain_string: bool) -> String {
    match value {
        Value::String(string) => {
            if plain_string {
                string
            } else {
                format!("\"{}\"", string.replace('"', "\\\""))
            }
        }
        Value::Integer(integer) => integer.to_string(),
        Value::Float(float) => float.to_string(),
        Value::Boolean(boolean) => boolean.to_string(),
        Value::Array(array) => {
            let mut result = String::new();
            result.push('[');
            for (i, value) in array.iter().enumerate() {
                if i != 0 {
                    result.push(';');
                }
                result.push_str(&serialize_value(value.clone(), false));
            }
            result.push(']');
            result
        }
        Value::Object(object) => {
            let mut result = String::new();
            result.push('{');
            let total = object.len();
            for (i, (key, value)) in object.iter().enumerate() {
                result.push_str(key);
                result.push(':');
                result.push_str(&serialize_value(value.clone(), false));
                if i != total - 1 {
                    result.push(',');
                }
            }
            result.push('}');
            result
        }
    }
}

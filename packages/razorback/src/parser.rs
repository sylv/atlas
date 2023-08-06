use pest::error::Error;
use pest::{iterators::Pair, Parser};
use pest_derive::Parser;

#[derive(Parser, Debug)]
#[grammar = "razorback.pest"]
pub enum Node<'a> {
    Value(Vec<Node<'a>>),
    Text(&'a str),
    // {name option=child1;child2;child3}
    Tag {
        name: &'a str,
        children: Vec<Node<'a>>,
    },
    // option="child1 {child2}"
    TagOption {
        name: &'a str,
        value: Box<Node<'a>>,
    },
    // {=name;value}
    VariableAssignment {
        name: &'a str,
        value: Box<Node<'a>>,
    },
    // {$name}
    VariableReference(&'a str),
    // {[child1;child2;child3]}
    Array(Vec<Node<'a>>),
    // this, lol
    Comment(&'a str),
}

pub fn serialize_node(val: &Node) -> String {
    match val {
        Node::Value(children) => {
            let mut result = String::new();
            for child in children {
                result.push_str(&serialize_node(child));
            }

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
            result.push('{');
            for child in children {
                result.push(';');
                result.push_str(&serialize_node(child));
            }
            result.push('}');
            result
        }
        Node::Comment(comment) => {
            let mut result = String::new();
            result.push_str(comment);
            result
        }
    }
}

pub fn parse_to_node(script: &str) -> Result<Node, Error<Rule>> {
    let value = Node::parse(Rule::value, script).unwrap();
    let value = Node::Value(value.map(parse_pair).collect());
    Ok(value)
}

fn parse_pair(pair: Pair<Rule>) -> Node {
    match pair.as_rule() {
        Rule::array => Node::Array(pair.into_inner().map(parse_pair).collect()),
        Rule::comment => Node::Comment(pair.as_str()),
        Rule::text => Node::Text(pair.as_str()),
        Rule::tag => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str();
            let children = inner.map(parse_pair).collect();
            Node::Tag { name, children }
        }
        Rule::variable_assign => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str();
            let value = inner.next().unwrap();
            Node::VariableAssignment {
                name,
                value: Box::new(parse_pair(value)),
            }
        }
        Rule::variable_reference => {
            Node::VariableReference(pair.into_inner().next().unwrap().as_str())
        }
        Rule::name => Node::Text(pair.as_str()),
        Rule::tag_param => parse_pair(pair.into_inner().next().unwrap()),
        Rule::value => Node::Value(pair.into_inner().map(parse_pair).collect()),
        Rule::tag_option => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str();
            let value = inner.next().unwrap();
            Node::TagOption {
                name,
                value: Box::new(parse_pair(value)),
            }
        }
        _ => unimplemented!("{:?}", pair),
    }
}

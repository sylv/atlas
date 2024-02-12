use crate::types::node::{Node, Rule};
use pest::error::Error;
use pest::{iterators::Pair, Parser};

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
        Rule::object => {
            let inner_object = pair.into_inner().next().unwrap();
            parse_pair(inner_object)
        }
        Rule::object_inner => {
            let children = pair.into_inner().map(|pair| {
                let mut inner_rules = pair.into_inner();
                let name = inner_rules
                    .next()
                    .unwrap()
                    .into_inner()
                    .next()
                    .unwrap()
                    .as_str();
                let value = parse_pair(inner_rules.next().unwrap());
                (name, value)
            });
            Node::Object(children.collect())
        }
        Rule::object_value => parse_pair(pair.into_inner().next().unwrap()),
        Rule::object_string => Node::Text(pair.into_inner().next().unwrap().as_str()),
        Rule::object_boolean => Node::Text(pair.as_str()),
        Rule::object_array => Node::Array(pair.into_inner().map(parse_pair).collect()),
        _ => unreachable!("Unknown rule: {:?}", pair.as_rule()),
    }
}

use crate::types::node::{Node, Rule};
use pest::error::Error;
use pest::{iterators::Pair, Parser};

pub fn parse_to_node(script: &str) -> Result<Node, Error<Rule>> {
    let value = Node::parse(Rule::script, script).unwrap();
    let value = Node::Value(value.map(parse_pair).collect());
    Ok(value)
}

fn parse_pair(pair: Pair<Rule>) -> Node {
    match pair.as_rule() {
        Rule::array => Node::Array(pair.into_inner().map(parse_pair).collect()),
        Rule::string => Node::Text(pair.into_inner().next().unwrap().as_str()),
        Rule::template_string => Node::Text(pair.as_str()),
        Rule::template_inner => {
            let mut children = Vec::new();
            for pair in pair.into_inner() {
                children.push(parse_pair(pair));
            }

            Node::Template(children)
        }
        Rule::call => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str();
            let mut options = Vec::new();
            let mut children = Vec::new();
            for pair in inner {
                match pair.as_rule() {
                    Rule::option => {
                        let mut inner = pair.into_inner();
                        let name = inner.next().unwrap().as_str();
                        let value = parse_pair(inner.next().unwrap());
                        options.push((name, value));
                    }
                    _ => children.push(parse_pair(pair)),
                }
            }

            Node::Call {
                name,
                options,
                children,
            }
        }
        Rule::assign => {
            let mut inner = pair.into_inner();
            let name = inner.next().unwrap().as_str();
            let value = inner.next().unwrap();
            Node::Assign {
                name,
                value: Box::new(parse_pair(value)),
            }
        }
        Rule::reference => Node::Reference(pair.into_inner().next().unwrap().as_str()),
        Rule::name => Node::Text(pair.as_str()),
        Rule::value => Node::Value(pair.into_inner().map(parse_pair).collect()),
        Rule::object => {
            let children = pair.into_inner().map(|pair| {
                let mut inner_rules = pair.into_inner();
                let name = inner_rules.next().unwrap().as_str();
                let value = parse_pair(inner_rules.next().unwrap());
                (name, value)
            });
            Node::Object(children.collect())
        }
        Rule::boolean => Node::Boolean(pair.as_str().parse().unwrap()),
        Rule::number => {
            if pair.as_str().contains('.') {
                Node::Float(pair.as_str().parse().unwrap())
            } else {
                Node::Integer(pair.as_str().parse().unwrap())
            }
        }
        Rule::script => Node::Value(pair.into_inner().map(parse_pair).collect()),
        Rule::EOI => Node::EOI(),
        _ => unreachable!("Unknown rule {:?}", pair.as_rule()),
    }
}

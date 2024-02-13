use pest_derive::Parser;

#[derive(Parser, Debug)]
#[grammar = "razorback.pest"]
pub enum Node<'a> {
    Value(Vec<Node<'a>>),
    Text(&'a str),
    Boolean(bool),
    Integer(u64),
    Float(f64),
    Template(Vec<Node<'a>>),
    Call {
        name: &'a str,
        options: Vec<(&'a str, Node<'a>)>,
        children: Vec<Node<'a>>,
    },
    Assign {
        name: &'a str,
        value: Box<Node<'a>>,
    },
    Reference(&'a str),
    Array(Vec<Node<'a>>),
    Object(Vec<(&'a str, Node<'a>)>),
}

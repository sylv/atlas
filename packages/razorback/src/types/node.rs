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
    Object(Vec<(&'a str, Node<'a>)>),
    Comment(&'a str),
}

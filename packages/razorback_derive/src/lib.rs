extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, FnArg, ItemFn, Type};

#[proc_macro_attribute]
pub fn razorback_tag(_args: TokenStream, input: TokenStream) -> TokenStream {
    let ast: ItemFn = parse_macro_input!(input);
    let fn_name = &ast.sig.ident;
    let fn_vis = &ast.vis;
    let fn_block = &ast.block;
    let output_type = &ast.sig.output;

    let inputs: Vec<_> = ast
        .sig
        .inputs
        .iter()
        .enumerate()
        .map(|(index, input)| {
            if let FnArg::Typed(cap) = input {
                if let Type::Path(type_path) = &*cap.ty {
                    let type_name = &type_path.path.segments[0].ident;
                    let param_name = &cap.pat;
                    if type_name == "Value" {
                        return quote! {
                            let #param_name = {
                                let child = children.get(#index).unwrap();
                                let value = interpreter.interpret_raw(child)?;
                                if let Some(value) = value {
                                    value
                                } else {
                                    return Err(EngineError::MissingValue);
                                }
                            };
                        };
                    }

                    return quote! {
                        let #param_name: #type_name = {
                            let child = children.get(#index).unwrap();
                            let value = interpreter.interpret_raw(child)?;
                            if let Some(value) = value {
                                value.try_into()?
                            } else {
                                return Err(EngineError::MissingValue);
                            }
                        };
                    };
                }
            }

            panic!("Function parameters should have type specified.");
        })
        .collect();

    let output = quote! {
        #[allow(clippy::ptr_arg)]
        #fn_vis fn #fn_name(interpreter: &mut Interpreter, children: &Vec<Node>) #output_type {
            #(#inputs)*
            #fn_block
        }
    };

    output.into()
}

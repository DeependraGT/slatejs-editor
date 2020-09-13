//Import react dependencies
import React, { useMemo, useState, useCallback } from "react";
//Import the slate editor factory
import { createEditor, Transforms, Editor, Node, Range, Point } from "slate";

//Import the slate components and React plugin
import { Slate, Editable, withReact } from "slate-react";


//Creating the Code custom element with using slate attributes and children
const CodeElement = props => {
    return (
        <pre {...props.attributes}>
            <code>{props.children}</code>
        </pre>
    )
}

const ListElement = props => {
    return (
        <ul {...props.attributes}>
            <li>{props.children}</li>
        </ul>
    )
}

const DefaultElement = props => {
    return <p {...props.attributes}>{props.children}</p>
}



// Define our own custom set of helpers.
const CustomEditor = {
    isBoldMarkActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: n => n.bold === true,
            universal: true,
        })

        return !!match
    },

    isCodeBlockActive(editor) {
        const [match] = Editor.nodes(editor, {
            match: n => n.type === 'code',
        })

        return !!match
    },

    toggleBoldMark(editor) {
        const isActive = CustomEditor.isBoldMarkActive(editor)
        Transforms.setNodes(
            editor,
            { bold: isActive ? null : true },
            { match: n => n.type === 'Text', split: true }
        )
    }
}




const TextEditor = () => {


    // Create a Slate editor object that won't change across renders.
    const editor = useMemo(() => withReact(createEditor()), [])

    // Add the initial value when setting up our state.
    const [value, setValue] = useState([
        {
            type: 'heading1',
            children: [{
                isInline: true,
                text: ''
            }],
        },
        {
            type: 'paragraph',
            children: [{ text: '' }]
        }
    ])


    // Define a rendering function besed on element passsed to props.
    // We can use useCallback here to memorize the function for subsequent renders
    const renderElement = useCallback(props => {
        switch (props.element.type) {
            case 'code':
                return <CodeElement {...props} />
            case 'list':
                return <ListElement {...props} />
            case 'heading1':
                return <h1 {...props.attributes}>{props.children}</h1>
            default:
                return <DefaultElement {...props} />
        }
    }, [])


    const Leaf = props => {
        return (
            <span
                {...props.attributes}
                style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
            >
                {props.children}
            </span>
        )
    }

    // Define a leaf rendering function that is memoized with `useCallback`.
    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])


    const backspaceHandler = useCallback(editor => {

        console.log(editor.selection)
        if (editor.selection && Range.isCollapsed(editor.selection)) {
            console.log("Yes collapsed!!")
            console.log(editor.selection.focus);
            //check if we are in second node with offset 0
            //return true to prevent the event
            console.log("path")
            console.log(editor.selection.focus.path[0]);
            console.log(editor.selection.focus.offset)
            if (editor.selection.focus.path[0] === 1 && editor.selection.focus.offset === 0) {
                console.log("Condition matched !!")
                return true;
            }
        }
    }, [])


    return (

        <Slate
            editor={editor}
            value={value}
            onChange={newValue => setValue(newValue)} >

            {/* <div>
                <button
                    onMouseDown={event => {
                        event.preventDefault()
                        CustomEditor.toggleBoldMark(editor)
                    }}
                >
                    Bold
        </button>
                <button
                    onMouseDown={event => {
                        event.preventDefault()
                        CustomEditor.toggleCodeBlock(editor)
                    }}
                >
                    Code Block
        </button>
            </div> */}
            <Editable

                placeholder={"Please enter text"}
                editor={Editor}

                // Pass in the 'renderElement' function
                renderElement={renderElement}

                renderLeaf={renderLeaf}


                //Registering handlers
                //Defining a new handler with prints the key that was pressed
                onKeyDown={event => {

                    if (event.key === 'Enter') {
                        console.log("Enter key pressed!!")

                        event.preventDefault();

                        const element = { type: 'paragraph', children: [{ text: '' }] }
                        Transforms.insertNodes(editor, element)
                    }

                    if (event.key === 'Backspace') {
                        console.log("Backspace Pressed!!");
                        const isBlockBack = backspaceHandler(editor);
                        if(isBlockBack){
                            event.preventDefault();
                            
                        }

                    }
                    if (!event.ctrlKey)
                        return;

                    console.log(editor);

                    switch (event.key) {

                        case '`':
                            //prevent the ampersand character from being insert
                            event.preventDefault();

                            // Set the currently selected blocks type to 'code'
                            Transforms.setNodes(
                                editor,
                                { type: 'code' },
                                { match: n => Editor.isBlock(editor, n) }
                            )
                            break
                        case '1':
                            //prevent the ampersand character from being insert
                            event.preventDefault();

                            // Set the currently selected blocks type to 'code'
                            Transforms.setNodes(
                                editor,
                                { type: 'list' },
                                { match: n => Editor.isBlock(editor, n) }
                            )
                            break;

                        case 'b':
                            event.preventDefault()
                            CustomEditor.toggleBoldMark(editor)
                            break;
                        default:
                            event.preventDefault();
                            break;
                    }
                }}
            />
        </Slate >
    )
}




export default TextEditor
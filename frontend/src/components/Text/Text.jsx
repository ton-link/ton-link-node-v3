import "./Text.css"

const Text = ({
    children,
    type = "1",
    ...props
}) => {
    return (
        <>
            <div {...props} class={`Text__${type}`}>{children}</div>
        </>
    )
}

export default Text
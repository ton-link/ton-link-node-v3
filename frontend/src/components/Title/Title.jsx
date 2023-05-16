import "./Title.css"

const Title = ({
    children,
    type = "1",
    ...props
}) => {
    return (
        <>
            <div {...props} class={`Title__${type}`}>
                {children}
            </div>
        </>
    )
}

export default Title
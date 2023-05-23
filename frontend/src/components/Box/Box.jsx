import "./Box.css"

const Box = ({
    children,
    center = false,
    ...props
}) => {
    return (
        <>
            <div {...props} class={`Box ${center ? 'Box__center' : ""}`}>
                {children}
            </div>
        </>
    )
}

export default Box
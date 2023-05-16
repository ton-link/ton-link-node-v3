import "./Badge.css"

const Badge = ({
    children,
    ...props
}) => {
    return (
        <>
            <div {...props} class="Badge Badge__success">{children}</div>
        </>
    )
}

export default Badge
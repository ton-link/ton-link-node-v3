import "./Input.css"

const Input = ({
    header,
    inputStyle,
    ...props
}) => {
    return (
        <>
            <div class="Input" style={inputStyle}>
                {header && <div class="Input__header">{header}</div>}
                <input class="Input__el" {...props} />
            </div>
        </>
    )
}

export default Input
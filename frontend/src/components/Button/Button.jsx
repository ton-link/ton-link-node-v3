import "./Button.css"

const Button = ({
    children,
    icon,
    color,
    size,
    ...props
}) => {
    return (
        <>
            <div {...props} class={`Button Button__${size} Button__${color}`}>
                {icon && <img src={icon} class="Button__icon" />}
                <div class="Button__text">{children}</div>
            </div>
        </>
    )
}

export default Button
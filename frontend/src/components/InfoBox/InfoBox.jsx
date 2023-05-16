import "./InfoBox.css"

const InfoBox = ({
    title,
    value,
    ...props
}) => {
    return (
        <>
            <div class="InfoBox" {...props}>
                <div class="InfoBox__title">{title}</div>
                <div class="InfoBox__value">{value}</div>
            </div>
        </>
    )
}

export default InfoBox
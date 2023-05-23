import "./Modal.css"

const Modal = ({
    children,
    opened,
    ...props
}) => {
    return (
        <>
            {opened && (
                <>
                    <div className="Modal__wrapper" {...props}>
                        <div className="Modal__in">
                            {children}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Modal
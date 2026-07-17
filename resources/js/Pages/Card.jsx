const Card = ({title, content}) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>{content}</p>
            <span>default</span>
        </div>
    );
}

export default Card;
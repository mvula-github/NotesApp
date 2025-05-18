import React from "react";
import PropTypes from "prop-types";

const EmptyCard = ({ imgSrc, message, alt }) => {
  return (
    <section
      className="flex flex-col items-center justify-center mt-20"
      aria-label="Empty State"
    >
      <figure>
        <img
          src={imgSrc}
          alt={alt || "No notes illustration"}
          className="w-60 max-w-full sm:w-40"
          role="img"
        />
        <figcaption className="sr-only">
          {alt || "No notes illustration"}
        </figcaption>
      </figure>
      <p className="w-full max-w-md text-sm font-medium text-slate-700 text-center leading-7 mt-5">
        {message}
      </p>
    </section>
  );
};

EmptyCard.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default EmptyCard;

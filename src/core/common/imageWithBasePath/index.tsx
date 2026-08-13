import React from 'react';
import { img_path} from '../../../environment';

interface Image {
  className?: string;
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  id?:string;
  style?: React.CSSProperties;
}

const ImageWithBasePath = (props: Image) => {
  // 1. Check if the src is already a full URL (starts with http or https)
  const isFullUrl = props.src.startsWith('http://') || props.src.startsWith('https://');

  // Combine the base path and the provided src to create the full image source URL
  // 2. Only prepend img_path if it's a relative local path
  const fullSrc = isFullUrl ? props.src : `${img_path}${props.src}`;
  
  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
      style={props.style}
    />
  );
};

export default ImageWithBasePath;

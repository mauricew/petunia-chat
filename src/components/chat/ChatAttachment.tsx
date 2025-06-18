import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type ChatAttachmentType = {
  onChange: (file?: File) => void;
  value: File | undefined;
}

export default function ChatAttachment(props: ChatAttachmentType) {
  const { onChange, value } = props

  console.log(value);

  const onDrop = useCallback((files: File[]) => {
    onChange(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 
      'image/*': ['.png', '.jpg', '.webp'],
      'application/pdf': []
     },
     maxFiles: 1,
     onDrop,
  });

  return (
    <div {...getRootProps()}>
      <input name="attachment" {...getInputProps()} />
      <div className="flex space-x-2 text-sm">
        {!value && (
          <p>{isDragActive ? 'drop here' : 'drag files here'}</p>
        )}
        {value && (
          <>
            <span>{value.bytes?.toString()}</span>
            <button onClick={() => onChange()}>clear file</button>
          </>
        )}

      </div>
    </div>
  )
}
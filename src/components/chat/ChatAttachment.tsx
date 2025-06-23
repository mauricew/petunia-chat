import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type ChatAttachmentType = {
  disabled: boolean;
  onChange: (file?: File) => void;
  value: File | undefined;
}

export default function ChatAttachment(props: ChatAttachmentType) {
  const { disabled, onChange, value } = props

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
     disabled,
  });

  return (
    <div {...getRootProps()}>
      <input name="attachment" {...getInputProps()} />
      <div className="flex mx-2 space-x-2 text-sm">
        {!value && (
          <p>{isDragActive ? 'drop here' : 'drag files/click here'}</p>
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
import { useRef, useState } from 'react';

import { Button } from '../../../button';
import * as styles from './custom-icon-picker.css';

const TARGET_SIZE = 128; // px — icons display small, no point storing larger
const JPEG_QUALITY = 0.85;
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/gif',
]);

interface CustomIconPickerProps {
  onSelect: (dataUrl: string) => void;
}

/**
 * Resize an image to at most TARGET_SIZE × TARGET_SIZE using canvas.
 * Returns a JPEG data URL at JPEG_QUALITY.
 * SVGs pass through without resize (vector, already tiny).
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVG: read directly, no resize needed
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // If already small enough, just re-encode
      if (img.width <= TARGET_SIZE && img.height <= TARGET_SIZE) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2d context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        return;
      }

      // Scale down proportionally to fit TARGET_SIZE × TARGET_SIZE
      const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export const CustomIconPicker = ({ onSelect }: CustomIconPickerProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Unsupported file type. Use PNG, JPEG, SVG, WebP, or GIF.');
      return;
    }

    setProcessing(true);
    resizeImage(file)
      .then(dataUrl => {
        setPreview(dataUrl);
        onSelect(dataUrl);
      })
      .catch(() => {
        setError('Failed to process image.');
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.uploadZone}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        {processing ? (
          <span>Processing...</span>
        ) : preview ? (
          <img src={preview} alt="Icon preview" className={styles.preview} />
        ) : (
          <>
            <span style={{ fontSize: '24px' }}>📁</span>
            <span>Click to upload image</span>
            <span className={styles.hint}>
              PNG, JPEG, SVG, WebP, GIF — auto-resized
            </span>
          </>
        )}
      </div>

      {preview && !processing && (
        <Button
          variant="plain"
          onClick={() => {
            setPreview(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
        >
          Choose different image
        </Button>
      )}

      {error && (
        <span
          className={styles.hint}
          style={{ color: 'var(--affine-warning-color)' }}
        >
          {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
        className={styles.fileInput}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// This function takes an image element and a crop object and returns a base64 string
export async function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      blob.name = fileName;
      resolve(blob);
    }, 'image/jpeg');
  });
}

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, initialAspect = undefined }) {
  const [aspectRatio, setAspectRatio] = useState(initialAspect);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      setCrop(centerAspectCrop(width, height, aspectRatio));
    } else {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 });
    }
  }

  const handleSave = async () => {
    if (completedCrop && imgRef.current) {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, 'cropped.jpg');
      onCropComplete(croppedBlob);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'black' }}>
        <h3 style={{ marginBottom: '1rem' }}>Sesuaikan Potongan Gambar</h3>
        
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Rasio Potongan:</label>
          <select 
            value={aspectRatio || ''} 
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setAspectRatio(val);
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                if (val) setCrop(centerAspectCrop(width, height, val));
              }
            }}
            style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid #ccc' }}
          >
            <option value="">Bebas</option>
            <option value={1}>1:1 (Persegi)</option>
            <option value={16/9}>16:9 (Layar Lebar)</option>
            <option value={4/3}>4:3 (Layar Standar)</option>
            <option value={9/16}>9:16 (Vertikal)</option>
          </select>
        </div>

        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspectRatio}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={onImageLoad}
            style={{ maxHeight: '60vh', maxWidth: '100%' }}
            alt="Crop me"
          />
        </ReactCrop>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={onCancel} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Simpan Potongan</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Fungsi memotong gambar dengan mempertahankan resolusi asli (HD/4K)
export async function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Pastikan crop dalam satuan piksel
  const pixelCrop = crop.unit === '%' 
    ? convertToPixelCrop(crop, image.width, image.height)
    : crop;

  const targetWidth = Math.max(1, Math.round(pixelCrop.width * scaleX));
  const targetHeight = Math.max(1, Math.round(pixelCrop.height * scaleY));
  const sourceX = Math.max(0, Math.round(pixelCrop.x * scaleX));
  const sourceY = Math.max(0, Math.round(pixelCrop.y * scaleY));

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      targetWidth,
      targetHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Canvas kosong saat pemrosesan gambar'));
        return;
      }
      blob.name = fileName;
      resolve(blob);
    }, 'image/jpeg', 0.92);
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
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    let initialCrop;
    if (aspectRatio) {
      initialCrop = centerAspectCrop(width, height, aspectRatio);
    } else {
      initialCrop = { unit: '%', x: 5, y: 5, width: 90, height: 90 };
    }
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  }

  const handleSave = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);
    try {
      const cropToUse = completedCrop || (crop ? convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height) : null);
      if (!cropToUse || !cropToUse.width || !cropToUse.height) {
        const fullCrop = { unit: 'px', x: 0, y: 0, width: imgRef.current.width, height: imgRef.current.height };
        const croppedBlob = await getCroppedImg(imgRef.current, fullCrop, 'cropped.jpg');
        onCropComplete(croppedBlob);
        return;
      }
      const croppedBlob = await getCroppedImg(imgRef.current, cropToUse, 'cropped.jpg');
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error('Error saat menyimpan potongan gambar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100000,
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
                const newCrop = val 
                  ? centerAspectCrop(width, height, val)
                  : { unit: '%', x: 5, y: 5, width: 90, height: 90 };
                setCrop(newCrop);
                setCompletedCrop(convertToPixelCrop(newCrop, width, height));
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
          <button 
            type="button"
            onClick={onCancel} 
            disabled={isProcessing}
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isProcessing}
            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}
          >
            {isProcessing ? 'Memproses...' : 'Simpan Potongan'}
          </button>
        </div>
      </div>
    </div>
  );
}

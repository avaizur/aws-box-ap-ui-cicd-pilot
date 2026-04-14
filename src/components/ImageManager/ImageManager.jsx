import { useState, useRef, useCallback, useEffect } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import * as imagesService from '../../services/images.service';
import styles from './ImageManager.module.scss';

export default function ImageManager({ entityType, entityId, images: initialImages = [], onImagesChange }) {
  const [images, setImages] = useState(initialImages);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const fileInputRef = useRef(null);
  const imageCounterRef = useRef(initialImages.length);

  useEffect(() => {
    setImages(initialImages);
    imageCounterRef.current = initialImages.length;
  }, [initialImages]);

  const notifyChange = (newImages) => {
    if (onImagesChange) {
      onImagesChange(newImages);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFiles(files);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = async (files) => {
    const newUploadingImages = files.map((file, index) => {
      imageCounterRef.current += 1;
      return {
        id: `uploading-${Date.now()}-${index}`,
        title: `Image-${imageCounterRef.current}`,
        status: 'uploading',
        file,
      };
    });

    setUploadingImages((prev) => [...prev, ...newUploadingImages]);

    // Upload each file
    for (const uploadingImage of newUploadingImages) {
      try {
        const result = await imagesService.uploadImage(
          uploadingImage.file,
          uploadingImage.title,
          null,
          entityType,
          entityId
        );

        // Remove from uploading and add to images
        setUploadingImages((prev) =>
          prev.filter((img) => img.id !== uploadingImage.id)
        );
        const newImage = { ...result, id: result.imageId };
        setImages((prev) => {
          const updated = [...prev, newImage];
          notifyChange(updated);
          return updated;
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
        // Remove from uploading on error
        setUploadingImages((prev) =>
          prev.filter((img) => img.id !== uploadingImage.id)
        );
        alert(`Failed to upload ${uploadingImage.title}`);
      }
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setEditTitle(image.title || '');
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const updated = await imagesService.updateImageTitle(editingImage.id, editTitle);
      setImages((prev) => {
        const updatedImages = prev.map((img) => (img.id === editingImage.id ? { ...img, ...updated } : img));
        notifyChange(updatedImages);
        return updatedImages;
      });
      setEditingImage(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update image title:', error);
      alert('Failed to update image title');
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm(`Are you sure you want to delete ${image.title || 'this image'}?`)) {
      return;
    }

    try {
      await imagesService.deleteImage(image.id);
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== image.id);
        notifyChange(updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const allImages = [
    ...images.map((img) => ({ ...img, status: 'loaded' })),
    ...uploadingImages,
  ];

  return (
    <div className={styles.imageManager}>
      <h3 className={styles.sectionTitle}>Product Images</h3>
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
        />
        {allImages.length === 0 && (
          <div className={styles.dropZoneText}>
            Drop images here or click to select
          </div>
        )}
      </div>

      {allImages.length > 0 && (
        <div className={styles.thumbnails}>
          {allImages.map((image) => (
            <div key={image.id} className={styles.thumbnailWrapper}>
              <div className={styles.thumbnail}>
                {image.status === 'uploading' ? (
                  <div className={styles.loading}>Loading...</div>
                ) : (
                  <img
                    src={imagesService.getThumbnailUrl(image.id)}
                    alt={image.title || 'Image'}
                    className={styles.thumbnailImage}
                  />
                )}
                {image.status === 'loaded' && (
                  <div className={styles.thumbnailOverlay}>
                    <button
                      className={`${styles.thumbnailButton} ${styles.editButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(image);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles.thumbnailButton} ${styles.deleteButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image);
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.thumbnailLabel}>
                {image.title || 'Untitled'}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!editingImage}
        onClose={() => {
          setEditingImage(null);
          setEditTitle('');
        }}
        title="Edit Image"
        footer={
          <div className={styles.modalFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingImage(null);
                setEditTitle('');
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        }
      >
        {editingImage && (
          <div className={styles.editModalContent}>
            <img
              src={imagesService.getOriginalImageUrl(editingImage.id)}
              alt={editingImage.title || 'Image'}
              className={styles.fullImage}
            />
            <Input
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}


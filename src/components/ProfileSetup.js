import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileSetup = () => {
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [relationship, setRelationship] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [images, setImages] = useState([null, null, null, null, null]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleImageChange = (index, e) => {
    if (e.target.files[0]) {
      const newImages = [...images];
      newImages[index] = e.target.files[0];
      setImages(newImages);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const newImageURLs = [];
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const imageRef = ref(storage, `profiles/${user.uid}/${images[i].name}`);
          await uploadBytes(imageRef, images[i]);
          const url = await getDownloadURL(imageRef);
          newImageURLs.push(url);
        } else {
          newImageURLs.push('');
        }
      }
      await setDoc(doc(db, 'users', user.uid), {
        bio,
        height,
        weight,
        location,
        age,
        sex,
        relationship,
        socialMedia,
        imageURLs: newImageURLs
      }, { merge: true });
      navigate('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="card">
      <h2>Set Up Your Profile</h2>
      <form onSubmit={handleSave}>
        <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <input type="text" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
        <input type="text" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="text" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
        <input type="text" placeholder="Sex" value={sex} onChange={(e) => setSex(e.target.value)} />
        <input type="text" placeholder="What are you looking for?" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
        <input type="text" placeholder="Social Media" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)} />
        {images.map((_, index) => (
          <div key={index}>
            <input type="file" onChange={(e) => handleImageChange(index, e)} />
            <div className="image-preview">
              {images[index] ? <img src={URL.createObjectURL(images[index])} alt="Profile" /> : <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</div>}
            </div>
          </div>
        ))}
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
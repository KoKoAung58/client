import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [relationship, setRelationship] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [images, setImages] = useState([null, null, null, null, null]);
  const [imageURLs, setImageURLs] = useState(['', '', '', '', '']);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userProfile = await getDoc(doc(db, 'users', user.uid));
        if (userProfile.exists()) {
          const profileData = userProfile.data();
          setProfile(profileData);
          setBio(profileData.bio);
          setHeight(profileData.height);
          setWeight(profileData.weight);
          setLocation(profileData.location);
          setAge(profileData.age);
          setSex(profileData.sex);
          setRelationship(profileData.relationship);
          setSocialMedia(profileData.socialMedia);
          setImageURLs(profileData.imageURLs || ['', '', '', '', '']);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleImageChange = (index, e) => {
    if (e.target.files[0]) {
      const newImages = [...images];
      newImages[index] = e.target.files[0];
      setImages(newImages);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Save button clicked"); // Debug log
    try {
      const newImageURLs = [...imageURLs];
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const imageRef = ref(storage, `profiles/${user.uid}/${images[i].name}`);
          await uploadBytes(imageRef, images[i]);
          newImageURLs[i] = await getDownloadURL(imageRef);
        }
      }
      console.log("Images uploaded and URLs retrieved:", newImageURLs); // Debug log
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
      setProfile({ bio, height, weight, location, age, sex, relationship, socialMedia, imageURLs: newImageURLs });
      setIsEditing(false);
      console.log("Profile updated successfully"); // Debug log
      navigate('/profile'); // Redirect to profile page after saving
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return profile ? (
    <div className="card">
      <h2>Profile</h2>
      {isEditing ? (
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
              <div className="image-preview" style={{ width: 100, height: 100, border: '1px solid #ddd', borderRadius: 8, margin: '10px 0', background: '#f8f9fa' }}>
                {images[index] ? <img src={URL.createObjectURL(images[index])} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : null}
              </div>
            </div>
          ))}
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          {imageURLs.map((url, index) => (
            <div key={index} className="image-preview" style={{ width: 100, height: 100, border: '1px solid #ddd', borderRadius: 8, margin: '10px 0', background: '#f8f9fa' }}>
              {url ? <img src={url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>+</div>}
            </div>
          ))}
          <p>Name: {user.email}</p>
          <p>Bio: {profile.bio}</p>
          <p>Height: {profile.height}</p>
          <p>Weight: {profile.weight}</p>
          <p>Location: {profile.location}</p>
          <p>Age: {profile.age}</p>
          <p>Sex: {profile.sex}</p>
          <p>Looking for: {profile.relationship}</p>
          <p>Social Media: {profile.socialMedia}</p>
          <button onClick={handleEdit}>Edit</button>
        </>
      )}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default Profile;

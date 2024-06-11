import {
  Client,
  Account,
  ID,
  Avatars,
  Query,
  Databases,
  Storage,
} from "react-native-appwrite";
export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jsm.react-native-course",
  projectId: "663cf3ce003da77eac06",
  databaseId: "6641d5270024648d8ff5",
  userCollectionId: "6641d555001a64c4969d",
  videoCollectionId: "6641d58a001f2223e8fd",
  storageId: "6641da150039cad36477",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();
client
  .setEndpoint(endpoint) // Your Appwrite Endpoint
  .setProject(projectId) // Your project ID
  .setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register user
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new error(error);
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get all Posts
export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId,[Query.orderDesc('$createdAt')]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Get Latest Posts
export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt", Query.limit(3)),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Search Posts
export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

// Get User Posts
export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId), Query.orderDesc('$createdAt'),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

//sign out
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

//File Preview
export const getFilePreview = async (fileId, type) => {
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

//upload file
export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };
  // const asset = {
  //   name: file.fileName? fie.fileName:"Img",
  //   type: file.mimeType,
  //   size: file.fileSize,
  //   uri: file.uri,
  // };


  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

//Create video
export const createVideo = async (form) => {
  try {
    const [thubmnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thubmnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thubmnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

// Get User's  Bookmarked Posts
export const getBookmarkedPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId), Query.equal('bookmarked',true),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};


// Search User's Bookmarked Posts
export const searchBookmarkedPosts = async (userId,query) => {
  try {

     // Get user's bookmarked posts
     const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId), Query.equal('bookmarked',true),
    ]);
    const filteredPosts = posts.documents.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase())
    );
    return filteredPosts;
  } catch (error) {
    throw new Error(error);
  }
};

//Update bookmark status
export const updateBookmarkStatus = async (bookmarkId, bookmarked) => {
  try {
      const response = await databases.updateDocument(
          databaseId,
          videoCollectionId,
          bookmarkId,
          { bookmarked }
      );
      if(response){
        await getAllPosts();
        await getBookmarkedPosts(response.creator.accountId);
        return response
      }
  } catch (error) {
      console.error('Error updating bookmark status:', error);
      throw error;
  }
};

export const getVideoById = async (videoId) => {
  try {
    const response = await databases.getDocument(databaseId, videoCollectionId, videoId);
    return response;
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
};
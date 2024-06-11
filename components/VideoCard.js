import { Text, View, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";
import { Video, ResizeMode } from "expo-av";
import { updateBookmarkStatus, getVideoById } from "../lib/appwrite";

// creator:{username,avatar}
const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    bookmarked,
    creator: { username, avatar },
  },
  refetching,
  showBookmarkIcon,
}) => {
  const [play, setPlay] = useState(false);
  const [bookmark, setBookmark] = useState(bookmarked);

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const videoData = await getVideoById($id);
        setBookmark(videoData.bookmarked);
      } catch (error) {
        console.error("Error fetching bookmark status:", error);
      }
    };

    fetchBookmarkStatus();
  }, [$id, bookmark]);

  const handleBookmarkPress = async () => {
    try {
      await updateBookmarkStatus($id, !bookmark);
      setBookmark(updateBookmarkStatus.bookmarked);
      Alert.alert(
        "Alert",
        `Bookmark ${bookmark ? "unsaved" : "saved"} successfully!`,
        [
          {
            text: "OK",
            onPress: refetching, // Execute the callback when the "OK" button is pressed
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error updating bookmark:", error);
      Alert.alert("Failed to update bookmark");
    }
  };
  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        {showBookmarkIcon && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBookmarkPress}
            className="pt-2"
          >
            <Image
              source={bookmark ? icons.filledHeart : icons.heart}
              className="w-5 h-5"
              resizeMode="contain"
              tintColor={"#fff"}
            />
          </TouchableOpacity>
        )}
      </View>
      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;

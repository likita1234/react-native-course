import { FlatList, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import { searchBookmarkedPosts, searchPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useLocalSearchParams, useRouteParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const Search = () => {
  const {user} = useGlobalContext();
  const { query, searchType } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() =>
    searchType === "bookmarkedSearch"
      ? searchBookmarkedPosts(user.$id, query)
      : searchPosts(query)
  );

  useEffect(() => {
    refetch();
  }, [query]);


  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} key={item.$id} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmediun text-sm text-gray-100">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white">{query}</Text>
            <View className="mt-6 mb-8">
              <SearchInput
                initialQuery={query}
                placeholder="Search a video topic"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;

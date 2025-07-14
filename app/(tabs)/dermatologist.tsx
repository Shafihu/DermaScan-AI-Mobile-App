"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme

// Mock data for dermatologists
const dermatologists = [
  {
    id: "1",
    name: "Dr. Kwame Addo",
    specialty: "General Dermatology, Skin Cancer",
    experience: "15 years",
    rating: 4.9,
    reviewCount: 127,
    availability: "Available Today",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop",
    verified: true,
    education: "University of Ghana Medical School",
    consultationFee: 1200,
    nextAvailable: "Today, 3:30 PM",
    acceptingNew: true,
    bio: "Dr. Addo specializes in skin cancer detection and treatment, with additional expertise in general dermatological conditions. He has published numerous research papers on early melanoma detection and tropical skin conditions.",
  },
  {
    id: "2",
    name: "Dr. Ama Osei",
    specialty: "Pediatric Dermatology, Eczema",
    experience: "12 years",
    rating: 4.8,
    reviewCount: 98,
    availability: "Available Tomorrow",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop",
    verified: true,
    education: "Kwame Nkrumah University of Science and Technology",
    consultationFee: 1100,
    nextAvailable: "Tomorrow, 10:15 AM",
    acceptingNew: true,
    bio: "Dr. Osei is a board-certified dermatologist specializing in pediatric skin conditions and eczema management. She takes a holistic approach to treatment, focusing on long-term skin health and tropical skin disorders.",
  },
  {
    id: "3",
    name: "Dr. Kofi Mensah",
    specialty: "Cosmetic Dermatology, Acne",
    experience: "8 years",
    rating: 4.7,
    reviewCount: 86,
    availability: "Available This Week",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&auto=format&fit=crop",
    verified: true,
    education: "University of Cape Coast Medical School",
    consultationFee: 1300,
    nextAvailable: "Wed, 2:00 PM",
    acceptingNew: true,
    bio: "Dr. Mensah combines medical dermatology with cosmetic expertise, specializing in acne treatment and scar management. He is known for his personalized treatment plans and attentive care for diverse skin types.",
  },
  {
    id: "4",
    name: "Dr. Abena Asante",
    specialty: "Surgical Dermatology, Psoriasis",
    experience: "20 years",
    rating: 4.9,
    reviewCount: 215,
    availability: "Limited Availability",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop",
    verified: true,
    education: "University of Ghana Medical School",
    consultationFee: 1500,
    nextAvailable: "Next Week",
    acceptingNew: false,
    bio: "With over two decades of experience, Dr. Asante is a leading expert in surgical dermatology and psoriasis treatment. She has pioneered several minimally invasive techniques for skin cancer removal and tropical skin conditions.",
  },
  {
    id: "5",
    name: "Dr. Yaw Darko",
    specialty: "Ethnic Skin, Hair Disorders",
    experience: "10 years",
    rating: 4.8,
    reviewCount: 92,
    availability: "Available Today",
    image:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=300&auto=format&fit=crop",
    verified: true,
    education: "Kwame Nkrumah University of Science and Technology",
    consultationFee: 1250,
    nextAvailable: "Today, 5:45 PM",
    acceptingNew: true,
    bio: "Dr. Darko specializes in dermatological issues specific to African skin types and hair disorders. He is committed to culturally competent care and has developed specialized treatments for various skin tones and hair textures common in Ghana.",
  },
];

// Consultation type definition
type ConsultationType = {
  id: string;
  type: string;
  description: string;
  icon: string;
  duration: string;
  price: number;
};

// Consultation options
const consultationTypes: ConsultationType[] = [
  {
    id: "video",
    type: "Video Consultation",
    description: "Face-to-face video call with a dermatologist",
    icon: "video",
    duration: "15-20 min",
    price: 600,
  },
  {
    id: "message",
    type: "Messaging Consult",
    description: "Send photos and messages to a dermatologist",
    icon: "message-square",
    duration: "24-48 hours",
    price: 400,
  },
  {
    id: "inperson",
    type: "In-Person Visit",
    description: "Schedule an office visit with a dermatologist",
    icon: "user",
    duration: "30-45 min",
    price: 1200,
  },
];

// Filter options
const filterOptions = [
  { id: "all", label: "All" },
  { id: "available_today", label: "Available Today" },
  { id: "top_rated", label: "Top Rated" },
  { id: "lowest_price", label: "Lowest Price" },
  { id: "most_experienced", label: "Most Experienced" },
];

// Specialty options
const specialtyOptions = [
  { id: "general", label: "General" },
  { id: "cosmetic", label: "Cosmetic" },
  { id: "pediatric", label: "Pediatric" },
  { id: "surgical", label: "Surgical" },
  { id: "hair", label: "Hair & Scalp" },
];

export default function DermatologistScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);
  const [filteredDermatologists, setFilteredDermatologists] =
    useState(dermatologists);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const filterHeight = useRef(new Animated.Value(0)).current;

  // Load recently viewed dermatologists
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const viewed = await AsyncStorage.getItem(
          "@DermaScanAI:recentlyViewedDermatologists"
        );
        if (viewed) {
          setRecentlyViewed(JSON.parse(viewed));
        }
      } catch (error) {
        console.error("Failed to load recently viewed dermatologists:", error);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Filter dermatologists based on search, filters, and specialty
  useEffect(() => {
    setLoading(true);

    // Simulate API call with a short delay
    setTimeout(() => {
      let filtered = [...dermatologists];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (doc) =>
            doc.name.toLowerCase().includes(query) ||
            doc.specialty.toLowerCase().includes(query) ||
            doc.bio.toLowerCase().includes(query)
        );
      }

      // Apply selected filter
      switch (selectedFilter) {
        case "available_today":
          filtered = filtered.filter((doc) =>
            doc.availability.includes("Today")
          );
          break;
        case "top_rated":
          filtered = filtered.sort((a, b) => b.rating - a.rating);
          break;
        case "lowest_price":
          filtered = filtered.sort(
            (a, b) => a.consultationFee - b.consultationFee
          );
          break;
        case "most_experienced":
          filtered = filtered.sort(
            (a, b) =>
              Number.parseInt(b.experience) - Number.parseInt(a.experience)
          );
          break;
      }

      // Apply specialty filter
      if (selectedSpecialty) {
        filtered = filtered.filter((doc) =>
          doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );
      }

      setFilteredDermatologists(filtered);
      setLoading(false);
    }, 500);
  }, [searchQuery, selectedFilter, selectedSpecialty]);

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    Animated.timing(filterHeight, {
      toValue: showFilters ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // View dermatologist profile
  const viewDermatologistProfile = (id: string) => {
    // Save to recently viewed
    const saveToRecent = async () => {
      try {
        let viewed = [...recentlyViewed];
        // Remove if already exists
        viewed = viewed.filter((docId) => docId !== id);
        // Add to beginning of array
        viewed.unshift(id);
        // Keep only last 5
        viewed = viewed.slice(0, 5);

        setRecentlyViewed(viewed);
        await AsyncStorage.setItem(
          "@DermaScanAI:recentlyViewedDermatologists",
          JSON.stringify(viewed)
        );
      } catch (error) {
        console.error("Failed to save recently viewed dermatologist:", error);
      }
    };

    saveToRecent();

    // Navigate to dermatologist profile
    router.push(`/dermatologist_profile/${id}` as any);
  };

  // Book consultation
  const bookConsultation = (
    dermatologistId: string,
    consultationType: string
  ) => {
    setSelectedConsultation(consultationType);
    // router.push({
    //   pathname: "/booking",
    //   params: {
    //     dermatologistId,
    //     consultationType,
    //   },
    // });
  };

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 80],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  const searchBarTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0],
    extrapolate: "clamp",
  });

  // Filter height animation
  const filterMaxHeight = filterHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  // Render filter item
  const renderFilterItem = ({
    item,
  }: {
    item: { id: string; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        selectedFilter === item.id && styles.filterItemSelected,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item.id && styles.filterTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Render specialty item
  const renderSpecialtyItem = ({
    item,
  }: {
    item: { id: string; label: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.specialtyItem,
        selectedSpecialty === item.id && styles.specialtyItemSelected,
      ]}
      onPress={() =>
        setSelectedSpecialty(selectedSpecialty === item.id ? null : item.id)
      }
    >
      <Text
        style={[
          styles.specialtyText,
          selectedSpecialty === item.id && styles.specialtyTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Render consultation type
  const renderConsultationType = ({ item }: { item: ConsultationType }) => (
    <TouchableOpacity
      style={[
        styles.consultationCard,
        selectedConsultation === item.id && styles.consultationCardSelected,
      ]}
      onPress={() =>
        setSelectedConsultation(
          selectedConsultation === item.id ? null : item.id
        )
      }
    >
      <View style={styles.consultationIconContainer}>
        <Feather
          name={item.icon as any}
          size={24}
          color={selectedConsultation === item.id ? "#FFF" : MAIN_COLOR}
        />
      </View>
      <View style={styles.consultationContent}>
        <Text style={styles.consultationType}>{item.type}</Text>
        <Text style={styles.consultationDescription}>{item.description}</Text>
        <View style={styles.consultationMeta}>
          <View style={styles.consultationDetail}>
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.consultationDetailText}>{item.duration}</Text>
          </View>
          <View style={styles.consultationDetail}>
            <Feather name="dollar-sign" size={14} color="#666" />
            <Text style={styles.consultationDetailText}>${item.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render dermatologist card
  const renderDermatologistCard = ({
    item,
  }: {
    item: (typeof dermatologists)[0];
  }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => viewDermatologistProfile(item.id)}
    >
      <View style={styles.doctorHeader}>
        <Image source={{ uri: item.image }} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <View style={styles.doctorNameRow}>
            <Text style={styles.doctorName}>{item.name}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={18} color="#1DA1F2" />
              </View>
            )}
          </View>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <View style={styles.doctorMeta}>
            <View style={styles.doctorMetaItem}>
              <Feather name="award" size={14} color="#666" />
              <Text style={styles.doctorMetaText}>{item.experience}</Text>
            </View>
            <View style={styles.doctorMetaItem}>
              <Feather name="star" size={14} color="#FFB800" />
              <Text style={styles.doctorMetaText}>
                {item.rating} ({item.reviewCount})
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.doctorBody}>
        <View style={styles.doctorAvailability}>
          <View
            style={[
              styles.availabilityIndicator,
              {
                backgroundColor: item.availability.includes("Today")
                  ? "#4CAF50"
                  : "#FFC107",
              },
            ]}
          />
          <Text style={styles.availabilityText}>{item.availability}</Text>
        </View>

        <View style={styles.consultationInfo}>
          <View style={styles.consultationPrice}>
            <Text style={styles.priceLabel}>Consultation</Text>
            <Text style={styles.priceValue}>₵{item.consultationFee}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => bookConsultation(item.id, "video")}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View
          style={[styles.headerContent, { opacity: headerOpacity }]}
        >
          <Text style={styles.headerTitle}>Find a Dermatologist</Text>
          <Text style={styles.headerSubtitle}>
            Connect with board-certified specialists
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            { transform: [{ translateY: searchBarTranslate }] },
          ]}
        >
          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, specialty, or condition"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
            <Feather name="sliders" size={20} color="#333" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Filter Section */}
      <Animated.View
        style={[styles.filtersContainer, { maxHeight: filterMaxHeight }]}
      >
        <Text style={styles.filterSectionTitle}>Filter by:</Text>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />

        <Text style={styles.filterSectionTitle}>Specialty:</Text>
        <FlatList
          data={specialtyOptions}
          renderItem={renderSpecialtyItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtiesList}
        />

        <View style={styles.filterActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSelectedFilter("all");
              setSelectedSpecialty(null);
              setSearchQuery("");
            }}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={toggleFilters}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Consultation Types */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Consultation Options</Text>
          <FlatList
            data={consultationTypes}
            renderItem={renderConsultationType}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.consultationsList}
            snapToInterval={width - 60}
            decelerationRate="fast"
            snapToAlignment="center"
          />
        </View>

        {/* Dermatologists List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Available Dermatologists
            </Text>
            <Text style={styles.resultCount}>
              {filteredDermatologists.length} found
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MAIN_COLOR} />
              <Text style={styles.loadingText}>Finding specialists...</Text>
            </View>
          ) : filteredDermatologists.length > 0 ? (
            filteredDermatologists.map((dermatologist) => (
              <View key={dermatologist.id}>
                {renderDermatologistCard({ item: dermatologist })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="search" size={50} color="#DDD" />
              <Text style={styles.emptyStateTitle}>
                No dermatologists found
              </Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters to find a specialist that
                meets your needs.
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedFilter("all");
                  setSelectedSpecialty(null);
                  setSearchQuery("");
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentlyViewedScroll}
            >
              {recentlyViewed.map((id) => {
                const doctor = dermatologists.find((d) => d.id === id);
                if (!doctor) return null;
                return (
                  <TouchableOpacity
                    key={id}
                    style={styles.recentDoctorCard}
                    onPress={() => viewDermatologistProfile(id)}
                  >
                    <Image
                      source={{ uri: doctor.image }}
                      style={styles.recentDoctorImage}
                    />
                    <Text style={styles.recentDoctorName}>{doctor.name}</Text>
                    <Text style={styles.recentDoctorSpecialty}>
                      {doctor.specialty.split(",")[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Insurance Information */}
        <View style={styles.insuranceContainer}>
          <View style={styles.insuranceHeader}>
            <Feather name="shield" size={24} color={"#2196F3"} />
            <Text style={styles.insuranceTitle}>Insurance Information</Text>
          </View>
          <Text style={styles.insuranceText}>
            Many of our dermatologists accept major insurance plans. During
            booking, you can verify if your insurance is accepted by your
            selected specialist.
          </Text>
          <TouchableOpacity style={styles.insuranceButton}>
            <Text style={styles.insuranceButtonText}>
              Learn More About Coverage
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    overflow: "hidden",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  filtersList: {
    paddingBottom: 15,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  filterItemSelected: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderColor: MAIN_COLOR,
  },
  filterText: {
    fontSize: 14,
    color: "#666666",
  },
  filterTextSelected: {
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  specialtiesList: {
    paddingBottom: 15,
  },
  specialtyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  specialtyItemSelected: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderColor: MAIN_COLOR,
  },
  specialtyText: {
    fontSize: 14,
    color: "#666666",
  },
  specialtyTextSelected: {
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  resetButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: MAIN_COLOR,
  },
  applyButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultCount: {
    fontSize: 14,
    color: "#999999",
  },
  consultationsList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  consultationCard: {
    width: width - 60,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  consultationCardSelected: {
    borderColor: MAIN_COLOR,
    backgroundColor: "rgba(255, 142, 110, 0.05)",
  },
  consultationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  consultationContent: {
    flex: 1,
  },
  consultationType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  consultationDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  consultationMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  consultationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  consultationDetailText: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 4,
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  doctorNameRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 4,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  verifiedBadge: {
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  doctorMetaText: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 4,
  },
  doctorBody: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  doctorAvailability: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: "#666666",
  },
  consultationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consultationPrice: {
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: 12,
    color: "#999999",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  bookButton: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  recentlyViewedScroll: {
    paddingLeft: 20,
  },
  recentDoctorCard: {
    width: 120,
    marginRight: 15,
    alignItems: "center",
  },
  recentDoctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  recentDoctorName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
    marginBottom: 2,
  },
  recentDoctorSpecialty: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  insuranceContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
  },
  insuranceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insuranceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 12,
  },
  insuranceText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 16,
  },
  insuranceButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  insuranceButtonText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
});

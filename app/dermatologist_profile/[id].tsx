/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const MAIN_COLOR = "#FF8E6E";

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
    languages: ["English", "Twi", "Ga"],
    address: "123 Korle Bu Road, Accra Central, Accra, Ghana",
    certifications: [
      "Ghana Medical and Dental Council",
      "West African College of Physicians",
    ],
    specializations: [
      "Skin Cancer Screening",
      "Acne",
      "Eczema",
      "Psoriasis",
      "Tropical Skin Conditions",
    ],
    education_details: [
      {
        degree: "MBChB",
        institution: "University of Ghana Medical School",
        year: "2005",
      },
      {
        degree: "Residency in Dermatology",
        institution: "Korle Bu Teaching Hospital",
        year: "2009",
      },
      {
        degree: "Fellowship in Dermatologic Oncology",
        institution: "University of Ghana Medical Centre",
        year: "2010",
      },
    ],
    reviews: [
      {
        id: "r1",
        patient: "Kwame T.",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Dr. Addo was thorough and took the time to explain my condition in detail. He answered all my questions and made me feel at ease. Highly recommend!",
      },
      {
        id: "r2",
        patient: "Ama L.",
        rating: 5,
        date: "1 month ago",
        comment:
          "Excellent experience. Dr. Addo detected an early-stage melanoma that other doctors had missed. His attention to detail potentially saved my life.",
      },
      {
        id: "r3",
        patient: "Kofi K.",
        rating: 4,
        date: "2 months ago",
        comment:
          "Very professional and knowledgeable. The wait time was a bit long, but the quality of care made up for it. Would definitely see him again.",
      },
    ],
    availableSlots: [
      { date: "Today", slots: ["3:30 PM", "4:15 PM", "5:00 PM"] },
      {
        date: "Tomorrow",
        slots: ["9:00 AM", "10:30 AM", "2:45 PM", "3:30 PM"],
      },
      { date: "Wed, May 7", slots: ["11:15 AM", "1:00 PM", "4:30 PM"] },
    ],
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
    languages: ["English", "Twi", "Fante"],
    address: "456 Children's Health Way, Kumasi, Ashanti Region, Ghana",
    certifications: [
      "Ghana Medical and Dental Council",
      "Society for Pediatric Dermatology",
    ],
    specializations: [
      "Pediatric Dermatology",
      "Eczema",
      "Allergic Skin Reactions",
      "Birthmarks",
      "Tropical Skin Disorders",
    ],
    education_details: [
      {
        degree: "MBChB",
        institution: "Kwame Nkrumah University of Science and Technology",
        year: "2008",
      },
      {
        degree: "Residency in Dermatology",
        institution: "Komfo Anokye Teaching Hospital",
        year: "2012",
      },
      {
        degree: "Fellowship in Pediatric Dermatology",
        institution: "Korle Bu Teaching Hospital",
        year: "2013",
      },
    ],
    reviews: [
      {
        id: "r1",
        patient: "Sarah M.",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Dr. Osei was amazing with my 4-year-old son. She was patient, kind, and explained everything in a way that both my son and I could understand.",
      },
      {
        id: "r2",
        patient: "James P.",
        rating: 5,
        date: "1 month ago",
        comment:
          "After seeing multiple doctors for my daughter's eczema, Dr. Osei was the only one who provided a treatment plan that actually worked. We're so grateful.",
      },
      {
        id: "r3",
        patient: "Aisha K.",
        rating: 4,
        date: "2 months ago",
        comment:
          "Very knowledgeable and great with kids. The office was a bit busy, but the care was excellent. Would recommend to any parent.",
      },
    ],
    availableSlots: [
      { date: "Tomorrow", slots: ["10:15 AM", "11:00 AM", "2:30 PM"] },
      {
        date: "Wed, May 7",
        slots: ["9:30 AM", "1:45 PM", "3:15 PM", "4:00 PM"],
      },
      { date: "Thu, May 8", slots: ["10:00 AM", "11:30 AM", "2:00 PM"] },
    ],
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

export default function DermatologistProfileScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const dermatologist =
    dermatologists.find((d) => d.id === id) || dermatologists[0];

  const [selectedTab, setSelectedTab] = useState("about");
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Book appointment
  const bookAppointment = () => {
    if (!selectedConsultation || !selectedTimeSlot) {
      return;
    }

    // router.push({
    //   pathname: "/booking_confirmation",
    //   params: {
    //     dermatologistId: dermatologist.id,
    //     consultationType: selectedConsultation,
    //     date: dermatologist.availableSlots[selectedDate].date,
    //     time: selectedTimeSlot,
    //   },
    // });
  };

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [300, 80],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [100, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Render review item
  const renderReview = (review: (typeof dermatologist.reviews)[0]) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {review.patient.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewName}>{review.patient}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather
              key={star}
              name="star"
              size={14}
              color={star <= review.rating ? "#FFB800" : "#E0E0E0"}
              style={{ marginLeft: 2 }}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  // Render consultation type
  const renderConsultationType = (item: ConsultationType) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.consultationOption,
        selectedConsultation === item.id && styles.consultationOptionSelected,
      ]}
      onPress={() => setSelectedConsultation(item.id)}
    >
      <Feather
        name={item.icon as any}
        size={20}
        color={selectedConsultation === item.id ? MAIN_COLOR : "#666"}
      />
      <Text
        style={[
          styles.consultationOptionText,
          selectedConsultation === item.id &&
            styles.consultationOptionTextSelected,
        ]}
      >
        {item.type}
      </Text>
      <Text style={styles.consultationOptionPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: dermatologist.image }}
          style={[styles.headerImage, { opacity: imageOpacity }]}
        />
        <View style={styles.headerOverlay} />

        <Animated.View
          style={[styles.headerTitle, { opacity: headerTitleOpacity }]}
        >
          <Text style={styles.headerTitleText}>{dermatologist.name}</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share" size={24} color="#FFF" />
        </TouchableOpacity>
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
        {/* Doctor Info Card */}
        <View style={styles.doctorInfoCard}>
          <View style={styles.doctorBasicInfo}>
            <Text style={styles.doctorName}>{dermatologist.name}</Text>
            <View style={styles.doctorSpecialtyRow}>
              <Text style={styles.doctorSpecialty}>
                {dermatologist.specialty}
              </Text>
              {dermatologist.verified && (
                <MaterialIcons name="verified" size={16} color="#1DA1F2" />
              )}
            </View>
            <View style={styles.doctorMetaRow}>
              <View style={styles.doctorMetaItem}>
                <Feather name="award" size={16} color="#666" />
                <Text style={styles.doctorMetaText}>
                  {dermatologist.experience}
                </Text>
              </View>
              <View style={styles.doctorMetaItem}>
                <Feather name="star" size={16} color="#FFB800" />
                <Text style={styles.doctorMetaText}>
                  {dermatologist.rating} ({dermatologist.reviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.doctorStats}>
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatValue}>
                {dermatologist.reviewCount}
              </Text>
              <Text style={styles.doctorStatLabel}>Reviews</Text>
            </View>
            <View style={styles.doctorStatDivider} />
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatValue}>
                {dermatologist.experience.split(" ")[0]}
              </Text>
              <Text style={styles.doctorStatLabel}>Years Exp.</Text>
            </View>
            <View style={styles.doctorStatDivider} />
            <View style={styles.doctorStatItem}>
              <Text style={styles.doctorStatValue}>{dermatologist.rating}</Text>
              <Text style={styles.doctorStatLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              selectedTab === "about" && styles.tabItemActive,
            ]}
            onPress={() => setSelectedTab("about")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "about" && styles.tabTextActive,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabItem,
              selectedTab === "reviews" && styles.tabItemActive,
            ]}
            onPress={() => setSelectedTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "reviews" && styles.tabTextActive,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabItem,
              selectedTab === "book" && styles.tabItemActive,
            ]}
            onPress={() => setSelectedTab("book")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "book" && styles.tabTextActive,
              ]}
            >
              Book
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* About Tab */}
          {selectedTab === "about" && (
            <View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Biography</Text>
                <Text style={styles.bioText}>{dermatologist.bio}</Text>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Specializations</Text>
                <View style={styles.specializationsList}>
                  {dermatologist.specializations.map(
                    (specialization, index) => (
                      <View key={index} style={styles.specializationItem}>
                        <Feather
                          name="check-circle"
                          size={16}
                          color={MAIN_COLOR}
                        />
                        <Text style={styles.specializationText}>
                          {specialization}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Education</Text>
                {dermatologist.education_details.map((edu, index) => (
                  <View key={index} style={styles.educationItem}>
                    <View style={styles.educationDot} />
                    <View style={styles.educationContent}>
                      <Text style={styles.educationDegree}>{edu.degree}</Text>
                      <Text style={styles.educationSchool}>
                        {edu.institution}
                      </Text>
                      <Text style={styles.educationYear}>{edu.year}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                <View style={styles.certificationsList}>
                  {dermatologist.certifications.map((certification, index) => (
                    <View key={index} style={styles.certificationItem}>
                      <Feather name="award" size={16} color={MAIN_COLOR} />
                      <Text style={styles.certificationText}>
                        {certification}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <View style={styles.languagesList}>
                  {dermatologist.languages.map((language, index) => (
                    <View key={index} style={styles.languageItem}>
                      <Text style={styles.languageText}>{language}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Office Location</Text>
                <View style={styles.locationContainer}>
                  <Feather
                    name="map-pin"
                    size={18}
                    color={MAIN_COLOR}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText}>
                    {dermatologist.address}
                  </Text>
                </View>
                <TouchableOpacity style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>View on Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews Tab */}
          {selectedTab === "reviews" && (
            <View>
              <View style={styles.reviewsSummary}>
                <View style={styles.reviewsRatingContainer}>
                  <Text style={styles.reviewsRatingValue}>
                    {dermatologist.rating}
                  </Text>
                  <View style={styles.reviewsStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Feather
                        key={star}
                        name="star"
                        size={16}
                        color={
                          star <= Math.round(dermatologist.rating)
                            ? "#FFB800"
                            : "#E0E0E0"
                        }
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewsCount}>
                    Based on {dermatologist.reviewCount} reviews
                  </Text>
                </View>
              </View>

              <View style={styles.reviewsList}>
                {dermatologist.reviews.map((review) => renderReview(review))}
              </View>

              <TouchableOpacity style={styles.allReviewsButton}>
                <Text style={styles.allReviewsButtonText}>See All Reviews</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Book Tab */}
          {selectedTab === "book" && (
            <View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  Select Consultation Type
                </Text>
                <View style={styles.consultationOptions}>
                  {consultationTypes.map((item) =>
                    renderConsultationType(item)
                  )}
                </View>
              </View>

              {selectedConsultation && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Date & Time</Text>
                    <View style={styles.dateSelector}>
                      {dermatologist.availableSlots.map((dateSlot, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dateOption,
                            selectedDate === index && styles.dateOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedDate(index);
                            setSelectedTimeSlot(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dateOptionText,
                              selectedDate === index &&
                                styles.dateOptionTextSelected,
                            ]}
                          >
                            {dateSlot.date}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionSubtitle}>
                      Available Time Slots
                    </Text>
                    <View style={styles.timeSlots}>
                      {dermatologist.availableSlots[selectedDate].slots.map(
                        (time, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.timeSlot,
                              selectedTimeSlot === time &&
                                styles.timeSlotSelected,
                            ]}
                            onPress={() => setSelectedTimeSlot(time)}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                selectedTimeSlot === time &&
                                  styles.timeSlotTextSelected,
                              ]}
                            >
                              {time}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>

                  <View style={styles.bookingSummary}>
                    <View style={styles.bookingSummaryRow}>
                      <Text style={styles.bookingSummaryLabel}>
                        Consultation Type:
                      </Text>
                      <Text style={styles.bookingSummaryValue}>
                        {
                          consultationTypes.find(
                            (c) => c.id === selectedConsultation
                          )?.type
                        }
                      </Text>
                    </View>
                    {selectedTimeSlot && (
                      <>
                        <View style={styles.bookingSummaryRow}>
                          <Text style={styles.bookingSummaryLabel}>
                            Date & Time:
                          </Text>
                          <Text style={styles.bookingSummaryValue}>
                            {dermatologist.availableSlots[selectedDate].date},{" "}
                            {selectedTimeSlot}
                          </Text>
                        </View>
                        <View style={styles.bookingSummaryRow}>
                          <Text style={styles.bookingSummaryLabel}>Fee:</Text>
                          <Text style={styles.bookingSummaryValue}>
                            $
                            {
                              consultationTypes.find(
                                (c) => c.id === selectedConsultation
                              )?.price
                            }
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.bookButton,
                      (!selectedTimeSlot || !selectedConsultation) &&
                        styles.bookButtonDisabled,
                    ]}
                    onPress={bookAppointment}
                    disabled={!selectedTimeSlot || !selectedConsultation}
                  >
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* Quick Action Buttons */}
      {selectedTab !== "book" && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setSelectedTab("book")}
          >
            <Text style={styles.quickActionButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    // zIndex: 9999,
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerTitle: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30,
  },
  doctorInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  doctorBasicInfo: {
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  doctorSpecialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  doctorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  doctorMetaText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
  doctorStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  doctorStatItem: {
    alignItems: "center",
  },
  doctorStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  doctorStatLabel: {
    fontSize: 12,
    color: "#999999",
  },
  doctorStatDivider: {
    width: 1,
    backgroundColor: "#F0F0F0",
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabItem: {
    paddingVertical: 15,
    marginRight: 20,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: MAIN_COLOR,
  },
  tabText: {
    fontSize: 16,
    color: "#999999",
  },
  tabTextActive: {
    color: MAIN_COLOR,
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666666",
  },
  specializationsList: {
    marginTop: 8,
  },
  specializationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  specializationText: {
    fontSize: 15,
    color: "#666666",
    marginLeft: 10,
  },
  educationItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  educationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: MAIN_COLOR,
    marginTop: 6,
    marginRight: 10,
  },
  educationContent: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  educationYear: {
    fontSize: 14,
    color: "#999999",
  },
  certificationsList: {
    marginTop: 8,
  },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  certificationText: {
    fontSize: 15,
    color: "#666666",
    marginLeft: 10,
  },
  languagesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  languageItem: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  languageText: {
    fontSize: 14,
    color: "#666666",
  },
  locationContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  locationIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  locationText: {
    fontSize: 15,
    color: "#666666",
    flex: 1,
    lineHeight: 22,
  },
  mapButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    fontSize: 14,
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  reviewsSummary: {
    alignItems: "center",
    marginBottom: 20,
  },
  reviewsRatingContainer: {
    alignItems: "center",
  },
  reviewsRatingValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  reviewsStars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
    color: "#999999",
  },
  reviewsList: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MAIN_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999999",
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
  },
  allReviewsButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  allReviewsButtonText: {
    fontSize: 14,
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  consultationOptions: {
    marginBottom: 20,
  },
  consultationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  consultationOptionSelected: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderColor: MAIN_COLOR,
  },
  consultationOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#666666",
    marginLeft: 12,
  },
  consultationOptionTextSelected: {
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  consultationOptionPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  dateSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dateOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  dateOptionSelected: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderColor: MAIN_COLOR,
  },
  dateOptionText: {
    fontSize: 14,
    color: "#666666",
  },
  dateOptionTextSelected: {
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  timeSlotSelected: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderColor: MAIN_COLOR,
  },
  timeSlotText: {
    fontSize: 14,
    color: "#666666",
  },
  timeSlotTextSelected: {
    color: MAIN_COLOR,
    fontWeight: "500",
  },
  bookingSummary: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bookingSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  bookingSummaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  bookingSummaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  bookButton: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  bookButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quickActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  quickActionButton: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quickActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 100,
  },
});

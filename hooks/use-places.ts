"use client";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface PlaceDetails {
  streetAddress: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number | null;
  lng: number | null;
  formattedAddress: string | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlaceDetails(address: string | null | undefined) {
  const [details, setDetails] = useState<PlaceDetails>({
    streetAddress: null,
    city: null,
    region: null,
    country: null,
    countryCode: null,
    lat: null,
    lng: null,
    formattedAddress: null,
    isLoading: false,
    error: null,
  });

  const [services, setServices] = useState<{
    places: google.maps.places.PlacesService | null;
    autocomplete: google.maps.places.AutocompleteService | null;
  }>({
    places: null,
    autocomplete: null,
  });

  // Initialize Google Places services
  useEffect(() => {
    const initServices = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const google = await loader.load();

        // Create dummy element for PlacesService
        const dummyElement = document.createElement("div");
        const placesService = new google.maps.places.PlacesService(
          dummyElement
        );
        const autocompleteService =
          new google.maps.places.AutocompleteService();

        setServices({
          places: placesService,
          autocomplete: autocompleteService,
        });
      } catch (error) {
        setDetails((prev) => ({
          ...prev,
          error: "Failed to load Google Places services",
          isLoading: false,
        }));
      }
    };

    initServices();
  }, []);

  // Function to extract address components
  const extractAddressComponents = useCallback(
    (components: google.maps.GeocoderAddressComponent[]) => {
      const result: { [key: string]: string } = {};

      components.forEach((component) => {
        const type = component.types[0];
        if (type === "street_number") {
          result.street_number = component.long_name;
        }
        if (type === "route") {
          result.route = component.long_name;
        }
        if (type === "locality") {
          result.city = component.long_name;
        }
        if (type === "administrative_area_level_1") {
          result.region = component.long_name;
        }
        if (type === "country") {
          result.country = component.long_name;
          result.countryCode = component.short_name;
        }
      });

      return {
        streetAddress:
          result.street_number && result.route
            ? `${result.street_number} ${result.route}`
            : result.route || null,
        city: result.city || null,
        region: result.region || null,
        country: result.country || null,
        countryCode: result.countryCode || null,
      };
    },
    []
  );

  // Get place details when address changes
  useEffect(() => {
    if (!address || !services.places || !services.autocomplete) return;

    const sessionToken = new google.maps.places.AutocompleteSessionToken();

    const getPlaceDetails = async () => {
      setDetails((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // First, get place predictions
        const predictionsPromise = new Promise<
          google.maps.places.AutocompletePrediction[]
        >((resolve, reject) => {
          services.autocomplete!.getPlacePredictions(
            {
              input: address,
              sessionToken,
            },
            (predictions, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                predictions &&
                predictions.length > 0
              ) {
                resolve(predictions);
              } else {
                reject(new Error("No predictions found"));
              }
            }
          );
        });

        const predictions = await predictionsPromise;
        const firstPrediction = predictions[0];

        // Then, get place details
        const detailsPromise = new Promise<google.maps.places.PlaceResult>(
          (resolve, reject) => {
            services.places!.getDetails(
              {
                placeId: firstPrediction.place_id,
                fields: ["address_components", "formatted_address", "geometry"],
                sessionToken,
              },
              (place, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  place
                ) {
                  resolve(place);
                } else {
                  reject(new Error("Failed to get place details"));
                }
              }
            );
          }
        );

        const placeDetails = await detailsPromise;

        if (
          placeDetails.address_components &&
          placeDetails.geometry?.location
        ) {
          const addressParts = extractAddressComponents(
            placeDetails.address_components
          );

          setDetails({
            ...addressParts,
            lat: placeDetails.geometry.location.lat(),
            lng: placeDetails.geometry.location.lng(),
            formattedAddress: placeDetails.formatted_address || null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setDetails((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get place details",
        }));
      }
    };

    const timeoutId = setTimeout(getPlaceDetails, 500);

    return () => clearTimeout(timeoutId);
  }, [
    address,
    services.places,
    services.autocomplete,
    extractAddressComponents,
  ]);

  return details;
}

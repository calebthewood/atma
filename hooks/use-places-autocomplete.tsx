"use client";

import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Place {
  description: string;
  place_id: string;
}

interface PlaceDetails {
  name: string;
  lat: number;
  lng: number;
}

interface UsePlacesAutocompleteReturn {
  isLoading: boolean;
  error: string | null;
  places: Place[];
  searchPlaces: (input: string) => void;
  getPlaceDetails: (
    placeId: string,
    description: string
  ) => Promise<PlaceDetails>;
  resetPlaces: () => void;
}

export function usePlacesAutocomplete(): UsePlacesAutocompleteReturn {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleApi, setGoogleApi] = useState<any>(null);
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [placesService, setPlacesService] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<any>(null);

  useEffect(() => {
    const loadPlacesLibrary = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        const googleInstance = await loader.load();
        setGoogleApi(googleInstance);

        const autocompleteService =
          new googleInstance.maps.places.AutocompleteService();
        setAutocompleteService(autocompleteService);

        const dummyElement = document.createElement("div");
        const detailsService = new googleInstance.maps.places.PlacesService(
          dummyElement
        );
        setPlacesService(detailsService);

        setSessionToken(
          new googleInstance.maps.places.AutocompleteSessionToken()
        );
        setError(null);
      } catch (error) {
        console.error("Error loading Google Places library:", error);
        setError("Failed to load location search");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlacesLibrary();
  }, []);

  const searchPlaces = (input: string) => {
    if (!input.trim() || !googleApi) {
      setPlaces([]);
      return;
    }

    if (autocompleteService && sessionToken) {
      autocompleteService.getPlacePredictions(
        {
          input,
          sessionToken,
          types: ["(regions)"],
        },
        (predictions: Place[], status: string) => {
          if (
            status === googleApi.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPlaces(predictions);
          } else {
            setPlaces([]);
          }
        }
      );
    }
  };

  const getPlaceDetails = (
    placeId: string,
    description: string
  ): Promise<PlaceDetails> => {
    return new Promise((resolve, reject) => {
      if (!googleApi || !placesService) {
        reject(new Error("Places service not initialized"));
        return;
      }

      placesService.getDetails(
        {
          placeId,
          fields: ["name", "geometry"],
        },
        (place: any, status: string) => {
          if (
            status === googleApi.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            resolve({
              name: description,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          } else {
            reject(new Error("Failed to get place details"));
          }
        }
      );
    });
  };

  const resetPlaces = () => {
    setPlaces([]);
  };

  return {
    isLoading,
    error,
    places,
    searchPlaces,
    getPlaceDetails,
    resetPlaces,
  };
}

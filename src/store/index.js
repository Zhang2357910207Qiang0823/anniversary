import { reactive } from 'vue'
import yearsData from '../mock/years.json'
import photosData from '../mock/photos.json'

export const store = reactive({
  years: yearsData,
  photos: photosData,
  isMusicPlaying: false,
  selectedYear: null,

  getPhotosByYear(year) {
    return this.photos.filter(p => p.year === Number(year))
  },

  getPhotoById(id) {
    return this.photos.find(p => p.id === id)
  },

  getPhotoIndexInYear(id, year) {
    const yearPhotos = this.getPhotosByYear(year)
    return yearPhotos.findIndex(p => p.id === id)
  },

  getYearInfo(year) {
    return this.years.find(y => y.year === Number(year))
  }
})

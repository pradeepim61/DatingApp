import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../Models/Member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';
import { Photo } from '../Models/Photo';
import { PaginationResponse } from '../Models/Pagination';
import { UserParams } from '../Models/UserParams';
import { setPaginatedResponse, setPaginationHeader } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  private accountService = inject(AccountService);
  paginatedresponse = signal<PaginationResponse<Member[]> | null>(null);
  memberCache = new Map();
  user = this.accountService.currentUser()
  userparams = signal<UserParams>(new UserParams(this.user))

  resetUserParams() {
    this.userparams.set(new UserParams(this.user));
  }

  getMembers() {
    console.log(Object.values(this.userparams()).join('-'));
    const response = this.memberCache.get(Object.values(this.userparams()).join('-'));

    if (response) return setPaginatedResponse(response, this.paginatedresponse);

    let params = setPaginationHeader(this.userparams().pageNumber, this.userparams().pageSize);

    params = params.append('minAge', this.userparams().minAge);
    params = params.append('maxAge', this.userparams().maxAge);
    params = params.append('gender', this.userparams().gender);
    params = params.append('orderBy', this.userparams().orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', { observe: 'response', params }).subscribe({
      next: response => {
        setPaginatedResponse(response, this.paginatedresponse);
        this.memberCache.set(Object.values(this.userparams()).join('-'), response);
      }
    })
  }

  getMember(username: string) {
    const member: Member = [...this.memberCache.values()].reduce((arr, elem) => arr.concat(elem.body),
      [] as Member[]).find((member: Member) => member.username === username);

    if (member !== undefined) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      //   tap(
      //   () => {
      //     this.members.update(members => members.map(m => {
      //       if (m.photos.includes(photo)) {
      //         m.photoUrl = photo.url
      //       }
      //       return m;
      //     }))
      //   }
      // )
    )
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => m.username == member.username
      //     ? member : m))
      // })
    )
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

}


import {Component, OnInit} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  auth;
  db;

  constructor() {
    firebase.initializeApp(environment.firebase);
  }

  ngOnInit() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.db.settings({
      timestampsInSnapshots: true
    });
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('requesting data at fbusers/' + user.uid);
        this.db.doc(`fbusers/${user.uid}`).get((doc) => {
          if (doc.exists) {
            console.log('data: ', doc.data());
          } else {
            console.log('doc doesn\'t exist');
          }
        });
      } else {
        console.log('no user');
      }
    });
  }

  verifydoc() {
    this.db.collection('fbusers').get().then((docs) => {
      docs.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());
      });
    });
  }

  register() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((res: any) =>
      res.additionalUserInfo.isNewUser ? this.db.collection('fbusers').add({
        uid: res.user.uid,
        name: res.additionalUserInfo.profile.name,
        email: {
          value: res.additionalUserInfo.profile.email ? res.additionalUserInfo.profile.email : '',
          verified: res.user.emailVerified ? res.user.emailVerified : '',
        },
        facebook: {
          Token: res.credential.accessToken,
        },
        personal: {
          gender: res.additionalUserInfo.profile.gender ? res.additionalUserInfo.profile.gender : '',
          phoneNumber: res.user.phoneNumber ? res.user.phoneNumber : '',
          picture: res.additionalUserInfo.profile.picture ? res.additionalUserInfo.profile.picture : '',
          birthday: res.additionalUserInfo.profile.birthday ? res.additionalUserInfo.profile.birthday : ''
        },
      }).then(() => console.log('register complete')).catch((err) => console.log(err)) : console.log('already loggedin'));
  }
}

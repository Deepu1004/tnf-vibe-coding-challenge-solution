async function run() {
  const FormData = require('form-data');
  const fs = require('fs');
  const fetch = require('node-fetch');

  // Request 1: Paper / Science
  let form1 = new FormData();
  form1.append('email', 'test1@test.com');
  form1.append('title', 'Test 1');
  form1.append('journal', 'Journal 1');
  form1.append('author_name', 'Author 1');
  form1.append('document_type', 'Paper');
  form1.append('document_kind', 'Science');
  form1.append('fingerprint', 'fp1');
  form1.append('file', Buffer.from('hello world 1'), { filename: 'test1.pdf', contentType: 'application/pdf' });

  let res1 = await fetch('http://localhost:5173/api/upload', { method: 'POST', body: form1 });
  console.log('Upload 1 (Paper/Science):', await res1.json());

  // Request 2: Book / Medical
  let form2 = new FormData();
  form2.append('email', 'test2@test.com');
  form2.append('title', 'Test 2');
  form2.append('journal', 'Journal 2');
  form2.append('author_name', 'Author 2');
  form2.append('document_type', 'Book');
  form2.append('document_kind', 'Medical');
  form2.append('fingerprint', 'fp2');
  form2.append('file', Buffer.from('hello world 2'), { filename: 'test2.pdf', contentType: 'application/pdf' });

  let res2 = await fetch('http://localhost:5173/api/upload', { method: 'POST', body: form2 });
  console.log('Upload 2 (Book/Medical):', await res2.json());
  
  // Request 3: Book / Science
  let form3 = new FormData();
  form3.append('email', 'test3@test.com');
  form3.append('title', 'Test 3');
  form3.append('journal', 'Journal 3');
  form3.append('author_name', 'Author 3');
  form3.append('document_type', 'Book');
  form3.append('document_kind', 'Science');
  form3.append('fingerprint', 'fp3');
  form3.append('file', Buffer.from('hello world 3'), { filename: 'test3.pdf', contentType: 'application/pdf' });

  let res3 = await fetch('http://localhost:5173/api/upload', { method: 'POST', body: form3 });
  console.log('Upload 3 (Book/Science):', await res3.json());
}

run().catch(console.error);

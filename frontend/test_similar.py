import requests

def upload(doc_type, doc_kind):
    res = requests.post("http://localhost:5173/api/upload", data={
        "email": "test@test.com",
        "title": f"Test {doc_type} {doc_kind}",
        "journal": "J",
        "author_name": "Author",
        "document_type": doc_type,
        "document_kind": doc_kind,
        "fingerprint": "fp_test"
    }, files={"file": ("test.pdf", b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF", "application/pdf")})
    print(f"Upload {doc_type}/{doc_kind}:", res.json().get('similar_document'))

upload("Paper", "Science")
upload("Book", "Medical")
upload("Book", "Science")
